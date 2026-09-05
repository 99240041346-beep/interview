import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';
import { getQuestions } from '@/lib/interview-questions';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { role, previousQuestion, previousAnswer } = await req.json();
  if (typeof role !== 'string') return NextResponse.json({ error: 'Role is required.' }, { status: 400 });
  const fallback = getQuestions(role)[Math.floor(Math.random() * getQuestions(role).length)];
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ question: fallback.question, category: fallback.category, followUps: fallback.followUps, source: 'question-bank' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.7, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a realistic senior interviewer. Generate ONE original real-world interview question for the requested role. It must test practical decision making, debugging, system design, communication, or role-specific knowledge. Avoid trivia and avoid repeating the previous question. Return JSON: question, category, followUps (array of 2 short follow-up questions).' },
        { role: 'user', content: `Role: ${role}\nPrevious question: ${previousQuestion || 'none'}\nPrevious answer: ${previousAnswer || 'none'}` }
      ]
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (typeof parsed.question === 'string') return NextResponse.json({ question: parsed.question, category: parsed.category || 'Real-world', followUps: Array.isArray(parsed.followUps) ? parsed.followUps.slice(0,2) : [], source: 'ai' });
  } catch {}
  return NextResponse.json({ question: fallback.question, category: fallback.category, followUps: fallback.followUps, source: 'question-bank' });
}
