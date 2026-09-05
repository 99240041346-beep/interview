import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { ENGINEERING_PROGRAM_MAP } from '@/lib/engineering-catalog';
import { getBankQuestions } from '@/lib/interview-bank';
import { getSubtopicQuestions } from '@/lib/subtopic-interview-bank';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: userId }, select: { department: true } });
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'aptitude';
  const topic = url.searchParams.get('topic') || '';
  if (!['aptitude','technical','coding','round1'].includes(type)) return NextResponse.json({ error: 'Invalid practice type.' }, { status: 400 });

  const department = user?.department || 'CSE';
  const program = ENGINEERING_PROGRAM_MAP.get(department) || ENGINEERING_PROGRAM_MAP.get('CSE')!;
  const moduleTopics = Array.from(new Set(program.tracks.flatMap(t => t.modules.map(m => m.title))));
  const exactSubtopic = topic && moduleTopics.includes(topic) ? getSubtopicQuestions(type, topic) : [];
  const classic = getBankQuestions(type, topic || undefined);
  const source = exactSubtopic.length ? exactSubtopic : classic;
  const relevant = source.length ? source : getSubtopicQuestions(type).filter(q => moduleTopics.includes(q.topic));
  const pool = relevant.length ? relevant : getBankQuestions(type);
  const round = Number(url.searchParams.get('round') || 1);
  const offset = pool.length ? ((Math.max(1, round) - 1) * 15) % pool.length : 0;
  const selected = pool.length ? Array.from({ length: Math.min(15, pool.length) }, (_, i) => pool[(offset + i) % pool.length]) : [];
  return NextResponse.json({ department: program.code, program: program.title, topics: moduleTopics, count: pool.length, questions: selected });
}
