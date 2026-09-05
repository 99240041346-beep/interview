import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { getCourse } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.certificate.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' } }));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const department = typeof body.department === 'string' ? body.department : 'CSE';
  const course = getCourse(department);
  const progress = await db.moduleProgress.findMany({ where: { userId, department: course.department, course: course.title } });
  const complete = course.modules.every((m) => progress.some((p) => p.moduleId === m.id && p.completed && p.examScore === 100));
  if (!complete) return NextResponse.json({ error: 'Complete every module and score 100% in every practical exam before requesting the certificate.' }, { status: 400 });
  const existing = await db.certificate.findFirst({ where: { userId, department: course.department, course: course.title } });
  if (existing) return NextResponse.json(existing);
  const certificateNo = `INT-${course.department.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  return NextResponse.json(await db.certificate.create({ data: { userId, department: course.department, course: course.title, certificateNo } }));
}
