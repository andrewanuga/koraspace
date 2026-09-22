import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

const neonDbUrl = process.env.NEON_BACKUP_DATABASE_URL;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!neonDbUrl) {
    return NextResponse.json({ 
      error: "NEON_BACKUP_DATABASE_URL is not configured in .env" 
    }, { status: 500 });
  }

  const backupPrisma = new PrismaClient({
    datasources: {
      db: { url: neonDbUrl }
    }
  });

  const syncStats: Record<string, number> = {};

  try {
    console.log("[Backup Sync] Starting complete 3-hour DB sync: Supabase Main -> Neon Backup...");

    // Helper to safely sync a model
    async function syncTable(name: string, fetchFn: () => Promise<any[]>, upsertFn: (item: any) => Promise<any>) {
      try {
        const items = await fetchFn();
        let count = 0;
        for (const item of items) {
          await upsertFn(item);
          count++;
        }
        syncStats[name] = count;
      } catch (err: any) {
        console.warn(`[Backup Sync] Table ${name} sync skipped or warning:`, err.message);
        syncStats[name] = 0;
      }
    }

    // 1. Profiles
    await syncTable("profiles", () => prisma.profile.findMany(), (item) => 
      backupPrisma.profile.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 2. Connected Accounts
    await syncTable("connected_accounts", () => prisma.connectedAccount.findMany(), (item) => 
      backupPrisma.connectedAccount.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 3. Brand Profiles
    await syncTable("brand_profiles", () => prisma.brandProfile.findMany(), (item) => 
      backupPrisma.brandProfile.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 4. Brand Memories
    await syncTable("brand_memories", () => prisma.brandMemory.findMany(), (item) => 
      backupPrisma.brandMemory.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 5. Scheduled Posts
    await syncTable("scheduled_posts", () => prisma.scheduledPost.findMany(), (item) => 
      backupPrisma.scheduledPost.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 6. Post History
    await syncTable("post_history", () => prisma.postHistory.findMany(), (item) => 
      backupPrisma.postHistory.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 7. Tasks
    await syncTable("tasks", () => prisma.task.findMany(), (item) => 
      backupPrisma.task.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 8. Bots
    await syncTable("bots", () => prisma.bot.findMany(), (item) => 
      backupPrisma.bot.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 9. Trends
    await syncTable("trends", () => prisma.trend.findMany(), (item) => 
      backupPrisma.trend.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 10. Inbox Messages
    await syncTable("inbox_messages", () => prisma.inboxMessage.findMany(), (item) => 
      backupPrisma.inboxMessage.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    // 11. Payments
    await syncTable("payments", () => prisma.payment.findMany(), (item) => 
      backupPrisma.payment.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    console.log("[Backup Sync] Finished with stats:", syncStats);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      synced_tables: syncStats
    });

  } catch (error: any) {
    console.error("[Backup Sync Critical Error]:", error);
    return NextResponse.json({ error: error.message || "Backup failed" }, { status: 500 });
  } finally {
    await backupPrisma.$disconnect();
  }
}
