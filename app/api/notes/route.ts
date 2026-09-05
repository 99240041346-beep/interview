import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await db.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }));
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  if (!title || !content.trim()) return NextResponse.json({ error: 'Title and note content are required.' }, { status: 400 });
  const note = await db.note.create({ data: { userId, title: title.slice(0, 120), content: content.slice(0, 30000) } });
  return NextResponse.json(note);
}

export async function PUT(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = String(body.id || '');
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  if (!id || !title || !content.trim()) return NextResponse.json({ error: 'Note data is required.' }, { status: 400 });
  const existing = await db.note.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
  return NextResponse.json(await db.note.update({ where: { id }, data: { title: title.slice(0, 120), content: content.slice(0, 30000) } }));
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Note id is required.' }, { status: 400 });
  const existing = await db.note.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
  await db.note.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
