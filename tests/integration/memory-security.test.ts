import { describe, it, expect } from "vitest";
import { MemoryService } from "@/lib/ai/memory/service";

// In-memory mock of Supabase to test workspace isolation semantics
function createMockSupabase(initialData: any[] = []) {
  let db = [...initialData];

  return {
    _getDb: () => db,
    from: (table: string) => {
      let filters: { field: string; value: any; op?: string }[] = [];
      let limitVal = 20;
      let offsetVal = 0;

      const builder: any = {
        select: (_cols?: string, _opts?: any) => builder,
        eq: (field: string, value: any) => {
          filters.push({ field, value, op: "eq" });
          return builder;
        },
        gte: (field: string, value: any) => {
          filters.push({ field, value, op: "gte" });
          return builder;
        },
        ilike: (field: string, value: any) => {
          filters.push({ field, value, op: "ilike" });
          return builder;
        },
        order: (_field: string, _opts?: any) => builder,
        range: (start: number, end: number) => {
          offsetVal = start;
          limitVal = end - start + 1;
          return builder;
        },
        single: async () => {
          const res = db.filter((row) =>
            filters.every((f) => {
              if (f.op === "eq") return row[f.field] === f.value;
              return true;
            })
          );
          return { data: res[0] || null, error: res[0] ? null : { message: "Row not found" } };
        },
        insert: (payload: any) => {
          const newRow = {
            id: payload.id || `mem-${Math.random().toString(36).substring(2, 8)}`,
            ...payload,
            created_at: new Date().toISOString(),
          };
          db.push(newRow);
          return {
            select: () => ({
              single: async () => ({ data: newRow, error: null }),
            }),
          };
        },
        update: (payload: any) => ({
          eq: (field1: string, val1: any) => ({
            eq: (field2: string, val2: any) => ({
              select: () => ({
                single: async () => {
                  const idx = db.findIndex(
                    (row) => row[field1] === val1 && row[field2] === val2
                  );
                  if (idx === -1) return { data: null, error: { message: "Not found" } };
                  db[idx] = { ...db[idx], ...payload };
                  return { data: db[idx], error: null };
                },
              }),
            }),
          }),
        }),
        delete: (_opts?: any) => ({
          eq: (field1: string, val1: any) => ({
            eq: (field2: string, val2: any) => {
              const prevLen = db.length;
              db = db.filter((row) => !(row[field1] === val1 && row[field2] === val2));
              return Promise.resolve({
                count: prevLen - db.length,
                error: null,
              });
            },
          }),
        }),
      };

      // Handle async resolution for select list
      builder.then = (resolve: any) => {
        const filtered = db.filter((row) =>
          filters.every((f) => {
            if (f.op === "eq") return row[f.field] === f.value;
            if (f.op === "gte") return row[f.field] >= f.value;
            if (f.op === "ilike") {
              const needle = f.value.replace(/%/g, "").toLowerCase();
              return String(row[f.field]).toLowerCase().includes(needle);
            }
            return true;
          })
        );
        const paged = filtered.slice(offsetVal, offsetVal + limitVal);
        resolve({ data: paged, count: filtered.length, error: null });
      };

      return builder;
    },
  } as any;
}

describe("Memory Multi-Tenant Workspace Security & Isolation", () => {
  const initialMemories = [
    {
      id: "mem-ws-a-1",
      user_id: "workspace-alpha",
      source: "chat",
      content: "Alpha confidential strategic rule: do not mention pricing before demo.",
      memory_type: "brand_rule",
      importance: 5,
      metadata: {},
      created_at: new Date().toISOString(),
    },
    {
      id: "mem-ws-b-1",
      user_id: "workspace-beta",
      source: "chat",
      content: "Beta public brand voice: friendly and upbeat.",
      memory_type: "preference",
      importance: 4,
      metadata: {},
      created_at: new Date().toISOString(),
    },
  ];

  it("should strictly list only memories belonging to the requesting workspace", async () => {
    const mockSupabase = createMockSupabase(initialMemories);

    const alphaResult = await MemoryService.listMemories("workspace-alpha", mockSupabase);
    expect(alphaResult.total).toBe(1);
    expect(alphaResult.memories[0].id).toBe("mem-ws-a-1");
    expect(alphaResult.memories.some((m) => m.workspaceId === "workspace-beta")).toBe(false);

    const betaResult = await MemoryService.listMemories("workspace-beta", mockSupabase);
    expect(betaResult.total).toBe(1);
    expect(betaResult.memories[0].id).toBe("mem-ws-b-1");
    expect(betaResult.memories.some((m) => m.workspaceId === "workspace-alpha")).toBe(false);
  });

  it("should prevent Workspace Beta from retrieving Workspace Alpha's memory by ID", async () => {
    const mockSupabase = createMockSupabase(initialMemories);

    // Cross-tenant access attempt
    const crossAccess = await MemoryService.getMemory("workspace-beta", "mem-ws-a-1", mockSupabase);
    expect(crossAccess).toBeNull();
  });

  it("should prevent Workspace Beta from updating Workspace Alpha's memory", async () => {
    const mockSupabase = createMockSupabase(initialMemories);

    // Cross-tenant update attempt
    const maliciousUpdate = await MemoryService.updateMemory(
      "workspace-beta",
      "mem-ws-a-1",
      { content: "Compromised content!" },
      mockSupabase
    );

    expect(maliciousUpdate).toBeNull();

    // Verify Alpha's memory remains unaltered
    const alphaRecord = await MemoryService.getMemory("workspace-alpha", "mem-ws-a-1", mockSupabase);
    expect(alphaRecord?.content).toContain("Alpha confidential");
  });

  it("should prevent Workspace Beta from deleting Workspace Alpha's memory", async () => {
    const mockSupabase = createMockSupabase(initialMemories);

    // Cross-tenant delete attempt
    const deleteResult = await MemoryService.forgetMemory(
      "workspace-beta",
      "mem-ws-a-1",
      mockSupabase
    );
    expect(deleteResult).toBe(false);

    // Verify Alpha's memory still exists
    const alphaRecord = await MemoryService.getMemory("workspace-alpha", "mem-ws-a-1", mockSupabase);
    expect(alphaRecord).not.toBeNull();
    expect(alphaRecord?.id).toBe("mem-ws-a-1");
  });

  it("should allow owner workspace to store, update, and delete their own memory", async () => {
    const mockSupabase = createMockSupabase(initialMemories);

    // 1. Store
    const stored = await MemoryService.storeMemory(
      "workspace-alpha",
      {
        content: "New verified audience fact for Alpha.",
        memoryType: "fact",
        importance: 4,
        source: "manual",
      },
      mockSupabase
    );
    expect(stored.workspaceId).toBe("workspace-alpha");

    // 2. Update
    const updated = await MemoryService.updateMemory(
      "workspace-alpha",
      stored.id,
      { importance: 5 },
      mockSupabase
    );
    expect(updated?.importance).toBe(5);

    // 3. Forget
    const deleted = await MemoryService.forgetMemory("workspace-alpha", stored.id, mockSupabase);
    expect(deleted).toBe(true);

    const forgotten = await MemoryService.getMemory("workspace-alpha", stored.id, mockSupabase);
    expect(forgotten).toBeNull();
  });
});
