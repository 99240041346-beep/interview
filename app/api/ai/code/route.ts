import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

function builtInSolution(language: string, module: string, task?: string) {
  const l = language.toLowerCase();
  const key = `${task || ''} ${module}`.toLowerCase();
  if (key.includes('palindrome') || key.includes('reverse string')) {
    if (l === 'python') return `text = input().strip()\nprint('YES' if text.lower() == text.lower()[::-1] else 'NO')`;
    if (l === 'javascript') return `const fs = require('fs');\nconst text = fs.readFileSync(0, 'utf8').trim();\nconst clean = text.toLowerCase();\nconsole.log(clean === [...clean].reverse().join('') ? 'YES' : 'NO');`;
    if (l === 'java') return `import java.util.*;\nclass Main { public static void main(String[] args) { Scanner sc=new Scanner(System.in); String s=sc.nextLine().trim().toLowerCase(); String r=new StringBuilder(s).reverse().toString(); System.out.println(s.equals(r) ? "YES" : "NO"); } }`;
    if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ string s; getline(cin,s); string r=s; reverse(r.begin(),r.end()); cout << (s==r ? "YES" : "NO"); }`;
  }
  if (key.includes('array') || key.includes('largest') || key.includes('maximum')) {
    if (l === 'python') return `n = int(input())\na = list(map(int, input().split()))\nprint(max(a[:n]))`;
    if (l === 'javascript') return `const fs=require('fs'); const a=fs.readFileSync(0,'utf8').trim().split(/\\s+/).map(Number); const n=a[0]; console.log(Math.max(...a.slice(1,n+1)));`;
    if (l === 'java') return `import java.util.*;\nclass Main { public static void main(String[] args){ Scanner sc=new Scanner(System.in); int n=sc.nextInt(), ans=Integer.MIN_VALUE; for(int i=0;i<n;i++) ans=Math.max(ans,sc.nextInt()); System.out.println(ans); } }`;
    if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ int n; cin>>n; int x,ans=INT_MIN; while(n--){cin>>x; ans=max(ans,x);} cout<<ans; }`;
  }
  if (l === 'python') return `# Reference template for ${module}\n# 1. Read input\n# 2. Apply the ${module} concept\n# 3. Handle edge cases\n# 4. Print the required result\n\nprint('Build the solution from the problem requirements')`;
  if (l === 'javascript') return `// Reference template for ${module}\n// 1. Read input\n// 2. Apply the concept\n// 3. Handle edge cases\n// 4. Print the result\nconsole.log('Build the solution from the problem requirements');`;
  if (l === 'java') return `class Main {\n  public static void main(String[] args) {\n    // Read input, apply ${module}, handle edge cases, and print the result.\n    System.out.println("Build the solution from the problem requirements");\n  }\n}`;
  if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  // Read input, apply ${module}, handle edge cases, and print the result.\n  cout << "Build the solution from the problem requirements";\n}`;
  return `// Reference template for ${module}`;
}

function fallback(module: string, language: string, code: string | undefined, task: string | undefined, solutionMode: boolean, reason: string) {
  const improvedCode = builtInSolution(language, module, task);
  const explanation = `Learn ${module} in four steps: understand the concept, identify the input and expected output, implement the simplest correct approach, then test normal and edge cases. For interviews, also explain why your approach works and its time/space complexity.`;
  return NextResponse.json({
    correct: solutionMode,
    score: solutionMode ? 100 : 0,
    output: solutionMode ? 'Reference explanation and code loaded locally.' : reason,
    feedback: solutionMode
      ? `${explanation} The reference code below is a study aid and was not executed.`
      : `${reason} Your code was not automatically judged. ${explanation} Use Explain & Show Code for the reference approach.`,
    improvedCode,
    source: 'built-in-fallback'
  });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const { course, module, language, code, task, solutionMode } = body;
  if (typeof module !== 'string' || typeof language !== 'string') return NextResponse.json({ error: 'Module and language are required.' }, { status: 400 });
  if (!solutionMode && (typeof code !== 'string' || code.trim().length < 5)) return NextResponse.json({ error: 'Write some code first.' }, { status: 400 });

  if (!process.env.OPENAI_API_KEY) {
    return fallback(module, language, code, task, Boolean(solutionMode), 'AI service is not configured.');
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = solutionMode
      ? `Course: ${course || 'Engineering learning'}\nModule: ${module}\nLanguage: ${language}\nTask: ${task || 'Create a practical example that teaches this module.'}\nProvide a clear explanation, algorithm/approach, time complexity, space complexity, edge cases and a complete reference implementation. Return JSON with correct=true, score=100, output, feedback, improvedCode.`
      : `Course: ${course || 'Engineering learning'}\nModule: ${module}\nLanguage: ${language}\nTask: ${task || `Write a practical program demonstrating ${module}.`}\nSubmitted code:\n${code}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: solutionMode ? 0.3 : 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: solutionMode
          ? 'You are an expert programming tutor. Explain the requested task simply, include approach, complexity and edge cases, then give a correct reference implementation. Return JSON with correct=true, score=100, output, feedback and improvedCode. Never claim to execute code.'
          : 'You are a coding-platform judge and tutor. Evaluate code conceptually for syntax, algorithm correctness, edge cases, input/output and language conventions. Do not claim to execute code. Return JSON with correct, score 0-100, output, feedback and improvedCode.' },
        { role: 'user', content: prompt }
      ]
    });
    const d = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({ correct: Boolean(d.correct), score: Math.max(0, Math.min(100, Number(d.score) || 0)), output: String(d.output || ''), feedback: String(d.feedback || ''), improvedCode: String(d.improvedCode || '') });
  } catch (error: any) {
    console.error('coding assistant AI error:', error);
    const status = Number(error?.status || 0);
    if (status === 429 || error?.code === 'insufficient_quota') {
      return fallback(module, language, code, task, Boolean(solutionMode), 'AI credits are currently exhausted.');
    }
    return fallback(module, language, code, task, Boolean(solutionMode), 'AI is temporarily unavailable.');
  }
}
