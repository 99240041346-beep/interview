import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

function scoreTranscript(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const keywords = ['because', 'example', 'project', 'result', 'learned', 'team', 'problem', 'solution'];
  const hits = keywords.filter(k => text.toLowerCase().includes(k)).length;
  return Math.max(20, Math.min(100, 35 + Math.min(words, 120) * .35 + hits * 5));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { role, mode, transcript } = await req.json();
  if (typeof role !== 'string' || typeof transcript !== 'string' || transcript.trim().length < 10) return NextResponse.json({ error: 'Provide an interview role and a longer answer.' }, { status: 400 });
  const score = Math.round(scoreTranscript(transcript));
  const feedback = score >= 80 ? 'Strong answer. Keep using specific examples and measurable results.' : score >= 60 ? 'Good foundation. Add clearer examples, results and a concise structure.' : 'Build a clearer answer with Situation, Action and Result, then practice speaking confidently.';
  const interview = await db.mockInterview.create({ data: { userId, role, mode: mode || 'text', score, feedback, transcript } });
  return NextResponse.json(interview);
}
