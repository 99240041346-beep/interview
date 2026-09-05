import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { ENGINEERING_PROGRAM_MAP } from '@/lib/engineering-catalog';

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
  const program = ENGINEERING_PROGRAM_MAP.get(department);
  if (!program) return NextResponse.json({ error: 'Unknown engineering program.' }, { status: 400 });
  const trackId = typeof body.trackId === 'string' ? body.trackId : program.tracks[0]?.id;
  const selected = program.tracks.find(t => t.id === trackId) || program.tracks[0];
  if (!selected) return NextResponse.json({ error: 'No learning track is configured for this program.' }, { status: 400 });
  const progress = await db.moduleProgress.findMany({ where: { userId, department: program.code } });
  const complete = selected.modules.every(m => progress.some(p => p.moduleId === m.id && p.completed && p.examScore === 100));
  if (!complete) return NextResponse.json({ error: 'Complete every module and score 100% in every practical assessment before requesting the certificate.' }, { status: 400 });
  const existing = await db.certificate.findFirst({ where: { userId, department: program.code, course: selected.title } });
  if (existing) return NextResponse.json(existing);
  const certificateNo = `INT-${program.code}-${Date.now().toString(36).toUpperCase()}`;
  return NextResponse.json(await db.certificate.create({ data: { userId, department: program.code, course: selected.title, certificateNo } }));
}
