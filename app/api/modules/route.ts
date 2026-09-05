import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { getCourse } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const department = url.searchParams.get('department') || 'CSE';
  const course = getCourse(department);
  const progress = await db.moduleProgress.findMany({ where: { userId, department: course.department, course: course.title } });
  return NextResponse.json({ course, progress });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const department = typeof body.department === 'string' ? body.department : 'CSE';
  const course = getCourse(department);
  const moduleId = String(body.moduleId || '');
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return NextResponse.json({ error: 'Invalid module.' }, { status: 400 });
  const score = Math.max(0, Math.min(100, Math.round(Number(body.score) || 0)));
  const completed = Boolean(body.completed) && score === 100;
  const record = await db.moduleProgress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    update: { department: course.department, course: course.title, completed, examScore: score, examPassed: score >= 70 },
    create: { userId, department: course.department, course: course.title, moduleId, completed, examScore: score, examPassed: score >= 70 },
  });
  return NextResponse.json(record);
}
