import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { ENGINEERING_PROGRAM_MAP } from '@/lib/engineering-catalog';
import { getBankQuestions } from '@/lib/interview-bank';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'aptitude';
  const topic = url.searchParams.get('topic') || '';
  const department = url.searchParams.get('department') || 'CSE';
  if (!['aptitude','technical','coding','round1'].includes(type)) return NextResponse.json({ error: 'Invalid practice type.' }, { status: 400 });
  const program = ENGINEERING_PROGRAM_MAP.get(department) || ENGINEERING_PROGRAM_MAP.get('CSE')!;
  const moduleTopics = program.tracks.flatMap(t => t.modules.map(m => m.title));
  const bank = getBankQuestions(type, topic || undefined);
  const relevant = type === 'aptitude' || type === 'round1'
    ? bank
    : bank.filter(q => moduleTopics.some(m => q.topic.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(q.topic.toLowerCase())));
  const source = relevant.length ? relevant : bank;
  const round = Number(url.searchParams.get('round') || 1);
  const offset = ((Math.max(1, round) - 1) * 15) % source.length;
  const selected = Array.from({ length: Math.min(15, source.length) }, (_, i) => source[(offset + i) % source.length]);
  return NextResponse.json({ department: program.code, program: program.title, topics: moduleTopics, count: source.length, questions: selected });
}
