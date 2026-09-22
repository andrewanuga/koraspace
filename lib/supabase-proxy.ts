import { prisma } from "@/lib/db";

class SupabaseQueryBuilder implements PromiseLike<any> {
  private table: string;
  private selects: string = "*";
  private conditions: string[] = [];
  private orderings: string = "";
  private limitCount: number | null = null;
  private singleResult: boolean = false;
  private isInsert: boolean = false;
  private isUpdate: boolean = false;
  private isDelete: boolean = false;
  private isUpsert: boolean = false;
  private payload: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    if (columns) this.selects = columns;
    return this;
  }

  eq(column: string, value: any) {
    if (value === null || value === undefined) {
      this.conditions.push(`"${column}" IS NULL`);
    } else if (typeof value === "string") {
      this.conditions.push(`"${column}" = '${value.replace(/'/g, "''")}'`);
    } else {
      this.conditions.push(`"${column}" = ${value}`);
    }
    return this;
  }
  
  neq(column: string, value: any) {
    if (value === null || value === undefined) {
      this.conditions.push(`"${column}" IS NOT NULL`);
    } else if (typeof value === "string") {
      this.conditions.push(`"${column}" != '${value.replace(/'/g, "''")}'`);
    } else {
      this.conditions.push(`"${column}" != ${value}`);
    }
    return this;
  }

  gte(column: string, value: any) {
    if (typeof value === "string") {
      this.conditions.push(`"${column}" >= '${value.replace(/'/g, "''")}'`);
    } else {
      this.conditions.push(`"${column}" >= ${value}`);
    }
    return this;
  }

  lte(column: string, value: any) {
    if (typeof value === "string") {
      this.conditions.push(`"${column}" <= '${value.replace(/'/g, "''")}'`);
    } else {
      this.conditions.push(`"${column}" <= ${value}`);
    }
    return this;
  }

  lt(column: string, value: any) {
    if (typeof value === "string") {
      this.conditions.push(`"${column}" < '${value.replace(/'/g, "''")}'`);
    } else {
      this.conditions.push(`"${column}" < ${value}`);
    }
    return this;
  }

  in(column: string, values: any[]) {
    if (!values || values.length === 0) {
      this.conditions.push("1=0");
    } else {
      const formatted = values.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(',');
      this.conditions.push(`"${column}" IN (${formatted})`);
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderings = `ORDER BY "${column}" ${options?.ascending ? "ASC" : "DESC"}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    this.limitCount = 1;
    return this;
  }

  maybeSingle() {
    this.singleResult = true;
    this.limitCount = 1;
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.payload = data;
    return this;
  }
  
  upsert(data: any, options?: any) {
    this.isUpsert = true;
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.payload = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      if (this.isInsert || this.isUpsert) {
        const isArray = Array.isArray(this.payload);
        const items = isArray ? this.payload : [this.payload];
        let result = [];
        for (const item of items) {
          const keys = Object.keys(item).map(k => `"${k}"`).join(", ");
          const vals = Object.values(item).map(v => {
            if (v === null) return "NULL";
            if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
            return typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : v;
          }).join(", ");
          let query = `INSERT INTO "${this.table}" (${keys}) VALUES (${vals})`;
          if (this.isUpsert) query += ` ON CONFLICT DO NOTHING`; 
          query += " RETURNING *";
          const res = await prisma.$queryRawUnsafe(query);
          result.push((res as any)[0]);
        }
        return { data: isArray ? result : result[0], error: null };
      }

      if (this.isUpdate) {
        const setString = Object.entries(this.payload).map(([k, v]) => {
          if (v === null) return `"${k}" = NULL`;
          if (typeof v === "object") return `"${k}" = '${JSON.stringify(v).replace(/'/g, "''")}'`;
          return typeof v === "string" ? `"${k}" = '${v.replace(/'/g, "''")}'` : `"${k}" = ${v}`;
        }).join(", ");
        let query = `UPDATE "${this.table}" SET ${setString}`;
        if (this.conditions.length > 0) query += ` WHERE ${this.conditions.join(" AND ")}`;
        query += " RETURNING *";
        const res = await prisma.$queryRawUnsafe(query);
        return { data: res as any, error: null };
      }
      
      if (this.isDelete) {
        let query = `DELETE FROM "${this.table}"`;
        if (this.conditions.length > 0) query += ` WHERE ${this.conditions.join(" AND ")}`;
        await prisma.$queryRawUnsafe(query);
        return { data: null, error: null };
      }

      let query = `SELECT ${this.selects} FROM "${this.table}"`;
      if (this.conditions.length > 0) query += ` WHERE ${this.conditions.join(" AND ")}`;
      if (this.orderings) query += ` ${this.orderings}`;
      if (this.limitCount) query += ` LIMIT ${this.limitCount}`;

      const data = await prisma.$queryRawUnsafe(query);
      if (this.singleResult) {
        return { data: (data as any)[0] || null, error: null };
      }
      return { data: data as any, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabaseProxy = {
  from: (table: string) => new SupabaseQueryBuilder(table),
  rpc: async (func: string, params?: any) => ({ data: null, error: null }),
  auth: { getUser: async () => ({ data: { user: null }, error: null }) }
};
