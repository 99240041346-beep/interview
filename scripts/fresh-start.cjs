const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // One-time migration for the requested fresh start. The marker prevents future deploys from wiping new student data.
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "_interview_bootstrap" ("key" TEXT PRIMARY KEY, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  const marker = await prisma.$queryRawUnsafe(`SELECT "key" FROM "_interview_bootstrap" WHERE "key" = 'fresh-start-2026-09-05' LIMIT 1`);
  if (marker.length) {
    console.log('[INTERVIEW] Fresh database reset already completed; keeping current student data.');
    return;
  }

  console.log('[INTERVIEW] Performing the requested one-time fresh database reset...');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Certificate", "ModuleProgress", "Note", "Resume", "MockInterview", "PracticeAttempt", "LearningProgress", "User" RESTART IDENTITY CASCADE`);
  await prisma.$executeRawUnsafe(`INSERT INTO "_interview_bootstrap" ("key") VALUES ('fresh-start-2026-09-05')`);
  console.log('[INTERVIEW] Database is clean. New student registrations can now start from zero.');
}

main().catch((error) => { console.error('[INTERVIEW] Fresh database reset failed:', error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
