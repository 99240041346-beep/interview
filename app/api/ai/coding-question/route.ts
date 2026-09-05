import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { course, module, language } = await req.json();
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ question: `Write a real-world ${language} program that demonstrates ${module}. Include input handling, edge cases and clear output.`, source: 'fallback' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.8, response_format: { type: 'json_object' }, messages: [
      { role: 'system', content: 'You are a coding-platform problem setter. Create one original real-world coding problem for a student. It must have a clear task, input format, output format, constraints, and one example. Do not give the solution. Return JSON with title, problem, input, output, constraints, example.' },
      { role: 'user', content: `Course: ${course}\nModule: ${module}\nLanguage: ${language}` }
    ]});
    const d=JSON.parse(completion.choices[0]?.message?.content||'{}');
    return NextResponse.json({ ...d, source:'ai' });
  } catch { return NextResponse.json({ error:'AI coding question could not be generated.' }, { status:503 }); }
}
