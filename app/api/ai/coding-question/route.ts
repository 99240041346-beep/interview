import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

const FALLBACK = {
  title: 'Maximum Subarray', level: 'Medium',
  problem: 'Given N integers, find the maximum possible sum of a non-empty contiguous subarray. Your solution must handle negative values and large input efficiently.',
  input: 'The first line contains T. For each test case, the first line contains N and the next line contains N integers.',
  output: 'For each test case, print the maximum subarray sum on a separate line.',
  constraints: '1 <= T <= 100; 1 <= N <= 2*10^5; -10^9 <= A[i] <= 10^9; sum of N over all test cases <= 2*10^5.',
  example: 'Input:\n2\n6\n-2 3 2 -1 4 -5  \n5\n-7 -2 -5 -1 -3\nOutput:\n8\n-1',
  timeLimit: '1 second', memoryLimit: '256 MB', source: 'built-in-example'
};

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { course, module, language } = await req.json();
  if (typeof module !== 'string' || typeof language !== 'string') return NextResponse.json({ error: 'Module and language are required.' }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ ...FALLBACK, source: 'fallback', module });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.8,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `You are the problem setter for a serious CodeChef-style competitive programming learning platform. Create ONE original, substantial programming challenge directly related to the requested engineering learning module. It must be solvable by a student in the selected language but should require real algorithmic thinking, not a toy exercise. Use competitive-programming conventions: a precise statement, multiple test cases when appropriate, standard input/output only, realistic large constraints, an explicit time limit and memory limit, and exactly one valid sample input/output. Difficulty must be Easy, Medium or Hard. Do NOT provide the solution, algorithm, hints, or code. Avoid ambiguous requirements, external files, interactive input, and impossible constraints. Return JSON only with: title, level, problem, input, output, constraints, example, timeLimit, memoryLimit.` },
        { role: 'user', content: `Course/track: ${course || 'Engineering learning'}\nLearning module: ${module}\nPreferred coding language: ${language}\nCreate a challenge that genuinely tests concepts from this module.` }
      ]
    });
    const d = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (!d.problem || !d.input || !d.output || !d.constraints || !d.example) return NextResponse.json({ ...FALLBACK, source: 'fallback', module });
    return NextResponse.json({ ...d, source: 'ai', module });
  } catch (error) {
    console.error('coding-question AI error:', error);
    return NextResponse.json({ ...FALLBACK, source: 'fallback', module });
  }
}
