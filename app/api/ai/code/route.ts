import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { course, module, language, code, task, solutionMode } = await req.json();
  if (typeof module !== 'string' || typeof language !== 'string') return NextResponse.json({ error: 'Module and language are required.' }, { status: 400 });
  if (!solutionMode && (typeof code !== 'string' || code.trim().length < 5)) return NextResponse.json({ error: 'Write some code first.' }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ correct: false, score: 0, output: 'AI is not configured.', feedback: 'Configure OPENAI_API_KEY to enable AI explanations, reference code and code checking.' }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = solutionMode
      ? `Course: ${course || 'Engineering learning'}\nModule: ${module}\nLanguage: ${language}\nTask: ${task || 'Create a practical example that teaches this module.'}\nProvide a clear explanation, approach, complexity, edge cases and a complete reference implementation. Return it in improvedCode and keep feedback concise.`
      : `Course: ${course || 'Engineering learning'}\nModule: ${module}\nLanguage: ${language}\nTask: ${task || `Write a practical program demonstrating ${module}.`}\nSubmitted code:\n${code}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: solutionMode ? 0.3 : 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: solutionMode
          ? 'You are an expert programming tutor. Explain the requested learning task simply, then give a correct reference implementation in the requested language. Return JSON with correct=true, score=100, output, feedback, improvedCode. Do not claim code was executed.'
          : 'You are a coding-platform judge and tutor. Evaluate submitted code conceptually for syntax, algorithm correctness, edge cases, input/output and language conventions. Do not claim to execute code. Return JSON with correct boolean, score 0-100, output, feedback and improvedCode containing corrected/reference code.' },
        { role: 'user', content: prompt }
      ]
    });
    const d = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({ correct: Boolean(d.correct), score: Math.max(0, Math.min(100, Number(d.score) || 0)), output: String(d.output || ''), feedback: String(d.feedback || ''), improvedCode: String(d.improvedCode || '') });
  } catch {
    return NextResponse.json({ error: 'AI coding assistant failed. Try again.' }, { status: 503 });
  }
}
