import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.practiceAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 }));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { type, topic, score, total } = await req.json();
  if (!['coding', 'aptitude', 'technical'].includes(type) || typeof topic !== 'string') return NextResponse.json({ error: 'Invalid practice data.' }, { status: 400 });
  const attempt = await db.practiceAttempt.create({ data: { userId, type, topic, score: Math.max(0, Number(score) || 0), total: Math.max(1, Number(total) || 10) } });
  return NextResponse.json(attempt);
}
