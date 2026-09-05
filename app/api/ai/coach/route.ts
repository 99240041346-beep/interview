import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function fallbackPlan(name: string, role: string, learning: number, practice: number, interview: number, resume: number) {
  const weak = [
    { score: learning, area: 'technical learning', action: 'Complete one technical topic and take its quiz.' },
    { score: practice, area: 'coding and aptitude practice', action: 'Solve 10 timed questions and review every mistake.' },
    { score: interview, area: 'mock interviews', action: 'Complete one mock interview and practice a STAR answer.' },
    { score: resume, area: 'resume', action: 'Improve your resume summary, projects and measurable achievements.' }
  ].sort((a, b) => a.score - b.score);
  return {
    source: 'smart-fallback',
    greeting: `Hi ${name}! I am your AI preparation manager for ${role}.`,
    summary: `Your next priority is ${weak[0].area}. Small daily improvements will raise your placement readiness fastest.`,
    priorities: weak.slice(0, 3).map((x, i) => ({ priority: i + 1, area: x.area, action: x.action })),
    today: [
      '25 min: learn or revise your weakest technical topic.',
      '20 min: complete a timed practice set.',
      '15 min: speak one interview answer aloud and improve its structure.'
    ],
    reminder: 'Return tomorrow after completing these tasks and the manager will reassess your progress.'
  };
}

async function getProfile() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId }, include: { progress: true } });
  if (!user) return null;
  const [attempts, interviews, resume] = await Promise.all([
    db.practiceAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.mockInterview.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.resume.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
  ]);
  const learning = user.progress.length ? Math.round(user.progress.reduce((a, p) => a + p.score, 0) / user.progress.length) : 0;
  const practice = attempts.length ? Math.round(attempts.reduce((a, p) => a + Math.round((p.score / Math.max(p.total, 1)) * 100), 0) / attempts.length) : 0;
  const interview = interviews.length ? Math.round(interviews.reduce((a, p) => a + p.score, 0) / interviews.length) : 0;
  const resumeScore = resume?.score ?? 0;
  const readiness = Math.round(learning * .35 + practice * .25 + interview * .25 + resumeScore * .15);
  return { user, learning, practice, interview, resume: resumeScore, readiness, progress: user.progress, recentAttempts: attempts.slice(0, 8), recentInterviews: interviews.slice(0, 3) };
}

async function askAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const client = new OpenAI({ apiKey: key });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      { role: 'system', content: 'You are INTERVIEW AI Manager, a concise student placement coach. Give practical, measurable advice. Never claim to have performed an action you did not perform. Return valid JSON only with keys: greeting, summary, priorities (array of {priority,area,action}), today (array of strings), reminder.' },
      { role: 'user', content: prompt }
    ]
  });
  const text = response.choices[0]?.message?.content?.trim() || '';
  try { return JSON.parse(text); } catch { return { greeting: 'AI Manager', summary: text, priorities: [], today: [], reminder: 'Keep practicing consistently.' }; }
}

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const fallback = fallbackPlan(profile.user.name, profile.user.targetRole, profile.learning, profile.practice, profile.interview, profile.resume);
    const ai = await askAI(JSON.stringify({
      student: profile.user.name,
      targetRole: profile.user.targetRole,
      scores: { readiness: profile.readiness, learning: profile.learning, practice: profile.practice, interview: profile.interview, resume: profile.resume },
      progress: profile.progress.map(p => ({ topic: p.topic, score: p.score })),
      recentPractice: profile.recentAttempts.map(p => ({ type: p.type, topic: p.topic, score: p.score, total: p.total })),
      recentInterviews: profile.recentInterviews.map(i => ({ role: i.role, score: i.score, feedback: i.feedback }))
    }));
    return NextResponse.json({ ...fallback, ...(ai || {}), source: ai ? 'openai' : 'smart-fallback', scores: { readiness: profile.readiness, learning: profile.learning, practice: profile.practice, interview: profile.interview, resume: profile.resume } });
  } catch {
    return NextResponse.json({ error: 'AI Manager is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const profile = await getProfile();
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 2000) return NextResponse.json({ error: 'Enter a message up to 2000 characters.' }, { status: 400 });
    const fallback = `Based on your current readiness of ${profile.readiness}%, focus first on your weakest area. Your learning score is ${profile.learning}%, practice ${profile.practice}%, interview ${profile.interview}%, and resume ${profile.resume}%.`;
    const ai = await askAI(JSON.stringify({ task: 'Answer the student question and give the next concrete action.', question: message, targetRole: profile.user.targetRole, scores: { readiness: profile.readiness, learning: profile.learning, practice: profile.practice, interview: profile.interview, resume: profile.resume }, progress: profile.progress.map(p => ({ topic: p.topic, score: p.score })) }));
    return NextResponse.json({ answer: ai?.summary || fallback, priorities: ai?.priorities || [], today: ai?.today || [] });
  } catch {
    return NextResponse.json({ error: 'AI Manager is temporarily unavailable.' }, { status: 503 });
  }
}
