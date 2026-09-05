import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: userId }, include: { progress: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const [attempts, interviews, resume] = await Promise.all([
    db.practiceAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.mockInterview.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.resume.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
  ]);
  const learning = user.progress.length ? Math.round(user.progress.reduce((a, p) => a + p.score, 0) / user.progress.length) : 0;
  const practice = attempts.length ? Math.round(attempts.reduce((a, p) => a + Math.round((p.score / Math.max(p.total, 1)) * 100), 0) / attempts.length) : 0;
  const interview = interviews.length ? Math.round(interviews.reduce((a, p) => a + p.score, 0) / interviews.length) : 0;
  const readiness = Math.round(learning * .35 + practice * .25 + interview * .25 + (resume?.score ?? 0) * .15);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, targetRole: user.targetRole }, stats: { learning, practice, interview, resume: resume?.score ?? 0, readiness }, progress: user.progress, attempts, interviews, resume });
}
