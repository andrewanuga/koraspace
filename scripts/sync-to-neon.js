const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const mainDbUrl = process.env.DATABASE_URL;
const backupDbUrl = process.env.NEON_BACKUP_DATABASE_URL;

if (!mainDbUrl || !backupDbUrl) {
  console.error("Missing DATABASE_URL (Main Supabase) or NEON_BACKUP_DATABASE_URL (Neon Backup) in .env");
  process.exit(1);
}

const mainPrisma = new PrismaClient({ datasources: { db: { url: mainDbUrl } } });
const backupPrisma = new PrismaClient({ datasources: { db: { url: backupDbUrl } } });

async function syncTable(name, fetchFn, upsertFn) {
  try {
    const items = await fetchFn();
    console.log(`Syncing ${items.length} records for table: ${name}...`);
    for (const item of items) {
      await upsertFn(item);
    }
  } catch (err) {
    console.warn(`[Warning] Skipping table ${name}:`, err.message);
  }
}

async function runSync() {
  console.log(`\n[${new Date().toISOString()}] === Starting Full Backup Sync: Supabase Main -> Neon Backup ===`);

  try {
    await syncTable("profiles", () => mainPrisma.profile.findMany(), (item) => 
      backupPrisma.profile.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("connected_accounts", () => mainPrisma.connectedAccount.findMany(), (item) => 
      backupPrisma.connectedAccount.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("brand_profiles", () => mainPrisma.brandProfile.findMany(), (item) => 
      backupPrisma.brandProfile.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("brand_memories", () => mainPrisma.brandMemory.findMany(), (item) => 
      backupPrisma.brandMemory.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("scheduled_posts", () => mainPrisma.scheduledPost.findMany(), (item) => 
      backupPrisma.scheduledPost.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("post_history", () => mainPrisma.postHistory.findMany(), (item) => 
      backupPrisma.postHistory.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("tasks", () => mainPrisma.task.findMany(), (item) => 
      backupPrisma.task.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("bots", () => mainPrisma.bot.findMany(), (item) => 
      backupPrisma.bot.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("trends", () => mainPrisma.trend.findMany(), (item) => 
      backupPrisma.trend.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("inbox_messages", () => mainPrisma.inboxMessage.findMany(), (item) => 
      backupPrisma.inboxMessage.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    await syncTable("payments", () => mainPrisma.payment.findMany(), (item) => 
      backupPrisma.payment.upsert({ where: { id: item.id }, update: { ...item }, create: { ...item } })
    );

    console.log(`[${new Date().toISOString()}] === Backup Sync Completed Successfully! ===\n`);
  } catch (err) {
    console.error("Critical Sync Error:", err);
  } finally {
    await mainPrisma.$disconnect();
    await backupPrisma.$disconnect();
  }
}

if (process.argv.includes('--daemon')) {
  console.log("Running in background daemon mode. Syncing every 3 hours...");
  runSync();
  setInterval(runSync, 3 * 60 * 60 * 1000);
} else {
  runSync();
}
