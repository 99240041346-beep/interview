const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const RESET_KEY = 'fresh-start-2026-09-05-v3';

async function main() {
  const marker = await prisma.systemMarker.findUnique({ where: { key: RESET_KEY } });
  if (marker) {
    console.log('[INTERVIEW] Fresh database reset already completed; keeping current student data.');
    return;
  }

  console.log('[INTERVIEW] Performing the requested one-time fresh database reset...');
  await prisma.$transaction(async (tx) => {
    await tx.certificate.deleteMany();
    await tx.moduleProgress.deleteMany();
    await tx.note.deleteMany();
    await tx.resume.deleteMany();
    await tx.mockInterview.deleteMany();
    await tx.practiceAttempt.deleteMany();
    await tx.learningProgress.deleteMany();
    await tx.user.deleteMany();
    await tx.systemMarker.create({ data: { key: RESET_KEY } });
  });
  console.log('[INTERVIEW] Database is clean. New student registrations can now start from zero.');
}

main()
  .catch((error) => {
    console.error('[INTERVIEW] Fresh database reset failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
