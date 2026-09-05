import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.learningProgress.findMany({ where: { userId }, orderBy: { topic: 'asc' } }));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { topic, score } = await req.json();
  if (typeof topic !== 'string' || typeof score !== 'number') return NextResponse.json({ error: 'Topic and score are required.' }, { status: 400 });
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const progress = await db.learningProgress.upsert({ where: { userId_topic: { userId, topic } }, update: { score: value }, create: { userId, topic, score: value } });
  return NextResponse.json(progress);
}
