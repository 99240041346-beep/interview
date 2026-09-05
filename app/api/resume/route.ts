import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

const skills = ['javascript','typescript','react','next.js','node.js','python','java','sql','postgresql','git','docker','aws','html','css','api','data structures','algorithms'];

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { fileName, text } = await req.json();
  if (typeof fileName !== 'string' || typeof text !== 'string' || text.trim().length < 40) return NextResponse.json({ error: 'Add resume text (at least 40 characters) for analysis.' }, { status: 400 });
  const lower = text.toLowerCase();
  const found = skills.filter(skill => lower.includes(skill));
  const sections = ['experience','education','project','skills','summary','contact'].filter(s => lower.includes(s));
  const score = Math.min(100, Math.round(found.length / skills.length * 55 + sections.length / 6 * 35 + (text.length > 900 ? 10 : 0)));
  const missing = ['summary','education','projects','skills','experience'].filter(s => !lower.includes(s));
  const feedback = `Matched skills: ${found.length}. Strong sections: ${sections.length}. ${missing.length ? `Consider adding: ${missing.join(', ')}.` : 'Core resume sections are present.'}`;
  const resume = await db.resume.create({ data: { userId, fileName, extracted: text.slice(0, 20000), score, feedback } });
  return NextResponse.json({ ...resume, skills: found });
}
