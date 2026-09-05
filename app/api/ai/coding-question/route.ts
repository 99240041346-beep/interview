import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

const EXAMPLES = [
  { title: 'Find the largest number', problem: 'Given N integers, find and print the largest value.', input: 'First line: N. Second line: N integers.', output: 'Print the largest integer.', constraints: '1 <= N <= 100000', example: 'Input: 5\n10 4 25 7 18\nOutput: 25' },
  { title: 'Count vowels in a string', problem: 'Given a string, count how many vowels (a, e, i, o, u) it contains. Treat uppercase and lowercase letters equally.', input: 'One line containing a string.', output: 'Print the number of vowels.', constraints: '1 <= length <= 10000', example: 'Input: Interview\nOutput: 4' },
  { title: 'Reverse an array', problem: 'Given N integers, reverse their order and print the resulting array.', input: 'First line: N. Second line: N integers.', output: 'Print the reversed array separated by spaces.', constraints: '1 <= N <= 100000', example: 'Input: 5\n1 2 3 4 5\nOutput: 5 4 3 2 1' },
  { title: 'Check a palindrome', problem: 'Given a string, determine whether it reads the same forward and backward.', input: 'One line containing a string.', output: 'Print YES if it is a palindrome, otherwise NO.', constraints: '1 <= length <= 10000', example: 'Input: madam\nOutput: YES' },
  { title: 'Two Sum', problem: 'Given an array and a target value, find two different positions whose values add up to the target.', input: 'First line: N and target. Second line: N integers.', output: 'Print the two 0-based indices, or -1 if no pair exists.', constraints: '2 <= N <= 100000', example: 'Input: 4 9\n2 7 11 15\nOutput: 0 1' },
  { title: 'Balanced brackets', problem: 'Given a string containing (), {}, and [], determine whether every opening bracket is correctly closed.', input: 'One line containing the bracket string.', output: 'Print YES when balanced, otherwise NO.', constraints: '1 <= length <= 100000', example: 'Input: {[()]}\nOutput: YES' },
];

function fallback(module: string, language: string) {
  const key = module.toLowerCase();
  let index = 0;
  if (key.includes('string') || key.includes('palindrome')) index = 1;
  else if (key.includes('array')) index = 2;
  else if (key.includes('stack') || key.includes('queue')) index = 5;
  else if (key.includes('hash') || key.includes('search')) index = 4;
  else if (key.includes('condition') || key.includes('loop') || key.includes('function')) index = 0;
  return { ...EXAMPLES[index], language, source: 'built-in-example' };
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { course, module, language } = await req.json();
  if (typeof module !== 'string' || typeof language !== 'string') return NextResponse.json({ error: 'Module and language are required.' }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallback(module, language));

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a coding-platform problem setter. Create one original practical problem for a student. It must have a clear task, input format, output format, constraints, and exactly one small example. Do not give the solution. Return JSON with title, problem, input, output, constraints, example.' },
        { role: 'user', content: `Course: ${course || 'Engineering learning'}\nModule: ${module}\nLanguage: ${language}` }
      ]
    });
    const d = JSON.parse(completion.choices[0]?.message?.content || '{}');
    if (!d.problem) return NextResponse.json(fallback(module, language));
    return NextResponse.json({ ...d, source: 'ai' });
  } catch (error) {
    console.error('coding-question AI error:', error);
    return NextResponse.json(fallback(module, language));
  }
}
