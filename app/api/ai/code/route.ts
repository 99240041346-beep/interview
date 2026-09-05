import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { course, module, language, code } = await req.json();
  if (typeof code !== 'string' || code.trim().length < 5) return NextResponse.json({ error: 'Write some code first.' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ correct: false, score: 0, output: 'AI judge is not configured. Your code was not executed.', feedback: 'Add OPENAI_API_KEY in the deployment environment to enable AI code judging.' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.1, response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a coding-platform judge. Evaluate whether the submitted code is a plausible complete solution for the learning task. Check syntax conceptually, algorithm correctness, edge cases, input/output approach, and language conventions. Do not claim to execute code. Return JSON with correct boolean, score integer 0-100, output short result message, feedback short actionable explanation, and improvedCode string.' },
        { role: 'user', content: `Course: ${course}\nModule: ${module}\nLanguage: ${language}\nTask: Write a practical program demonstrating this module.\nSubmitted code:\n${code}` }
      ]
    });
    const d = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({ correct: Boolean(d.correct), score: Math.max(0, Math.min(100, Number(d.score) || 0)), output: String(d.output || ''), feedback: String(d.feedback || ''), improvedCode: String(d.improvedCode || '') });
  } catch { return NextResponse.json({ error: 'AI code judging failed. Try again.' }, { status: 503 }); }
}
