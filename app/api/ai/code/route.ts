import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

function builtInSolution(language: string, module: string, task?: string) {
  const l = language.toLowerCase();
  const key = (task || module).toLowerCase();
  if (key.includes('palindrome') || key.includes('string')) {
    if (l === 'python') return `text = input().strip()\nprint('YES' if text.lower() == text.lower()[::-1] else 'NO')`;
    if (l === 'javascript') return `const fs = require('fs');\nconst text = fs.readFileSync(0, 'utf8').trim();\nconst clean = text.toLowerCase();\nconsole.log(clean === [...clean].reverse().join('') ? 'YES' : 'NO');`;
    if (l === 'java') return `import java.util.*;\nclass Main { public static void main(String[] args) { Scanner sc=new Scanner(System.in); String s=sc.nextLine().trim().toLowerCase(); String r=new StringBuilder(s).reverse().toString(); System.out.println(s.equals(r) ? "YES" : "NO"); } }`;
    if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ string s; getline(cin,s); string r=s; reverse(r.begin(),r.end()); cout << (s==r ? "YES" : "NO"); }`;
  }
  if (key.includes('array') || key.includes('largest')) {
    if (l === 'python') return `n = int(input())\na = list(map(int, input().split()))\nprint(max(a[:n]))`;
    if (l === 'javascript') return `const fs=require('fs'); const a=fs.readFileSync(0,'utf8').trim().split(/\\s+/).map(Number); const n=a[0]; console.log(Math.max(...a.slice(1,n+1)));`;
    if (l === 'java') return `import java.util.*;\nclass Main { public static void main(String[] args){ Scanner sc=new Scanner(System.in); int n=sc.nextInt(), ans=Integer.MIN_VALUE; for(int i=0;i<n;i++) ans=Math.max(ans,sc.nextInt()); System.out.println(ans); } }`;
    if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ int n; cin>>n; int x,ans=INT_MIN; while(n--){cin>>x; ans=max(ans,x);} cout<<ans; }`;
  }
  if (l === 'python') return `# Example starter solution for ${module}\n# Read the input, process it according to the problem, and print the result.\nprint('Implement the ${module} solution here')`;
  if (l === 'javascript') return `// Example starter solution for ${module}\nconsole.log('Implement the ${module} solution here');`;
  if (l === 'java') return `class Main { public static void main(String[] args) { System.out.println("Implement the ${module} solution here"); } }`;
  if (l === 'c++') return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){ cout << "Implement the ${module} solution here"; }`;
  return `// Implement the ${module} solution here`;
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const { course, module, language, code, task, solutionMode } = body;
  if (typeof module !== 'string' || typeof language !== 'string') return NextResponse.json({ error: 'Module and language are required.' }, { status: 400 });
  if (!solutionMode && (typeof code !== 'string' || code.trim().length < 5)) return NextResponse.json({ error: 'Write some code first.' }, { status: 400 });

  const fallbackCode = builtInSolution(language, module, task);
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      correct: Boolean(solutionMode),
      score: solutionMode ? 100 : 0,
      output: solutionMode ? 'Built-in reference solution loaded.' : 'AI service is not configured, so automatic judging is unavailable.',
      feedback: solutionMode ? `Use this reference implementation to study ${module}. Test it with normal and edge-case inputs. This code was not executed here.` : 'Your code was received, but an AI key is required for automatic code checking. You can still use the built-in reference solution.',
      improvedCode: fallbackCode,
      source: 'built-in-fallback'
    });
  }

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
  } catch (error) {
    console.error('coding assistant AI error:', error);
    return NextResponse.json({
      correct: Boolean(solutionMode),
      score: solutionMode ? 100 : 0,
      output: solutionMode ? 'AI temporarily unavailable; showing a built-in reference.' : 'AI temporarily unavailable; your code was not automatically judged.',
      feedback: solutionMode ? `Reference solution for ${module}. This code was not executed here.` : 'Try again in a moment. You can also click Explain & Show Code to use the built-in reference fallback if the AI service is unavailable.',
      improvedCode: fallbackCode,
      source: 'error-fallback'
    });
  }
}
