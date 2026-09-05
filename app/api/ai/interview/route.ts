import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';
import { db } from '@/lib/db';
import { getQuestions } from '@/lib/interview-questions';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { previousQuestion, previousAnswer } = await req.json();
  const user = await db.user.findUnique({ where: { id: userId }, select: { targetRole: true } });
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  const role = user.targetRole;
  const bank = getQuestions(role);
  const fallback = bank[Math.floor(Math.random() * bank.length)];
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ question: fallback.question, category: fallback.category, followUps: fallback.followUps, source: 'question-bank' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.7, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a realistic senior interviewer. Generate ONE original important interview question for the candidate role. Focus on questions commonly used in real interviews: practical decision making, debugging, projects, core technical knowledge, coding, system design, or behavioral communication. Avoid trivia and avoid repeating the previous question. Return JSON: question, category, followUps (array of 2 short follow-up questions).' },
        { role: 'user', content: `Role: ${role}\nPrevious question: ${previousQuestion || 'none'}\nPrevious answer: ${previousAnswer || 'none'}` }
      ]
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (typeof parsed.question === 'string') return NextResponse.json({ question: parsed.question, category: parsed.category || 'Real-world', followUps: Array.isArray(parsed.followUps) ? parsed.followUps.slice(0,2) : [], source: 'ai' });
  } catch {}
  return NextResponse.json({ question: fallback.question, category: fallback.category, followUps: fallback.followUps, source: 'question-bank' });
}
