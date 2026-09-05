import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { ENGINEERING_CODES } from '@/lib/engineering-catalog';

export async function POST(req: Request) {
  try {
    const { name, email, password, targetRole, department } = await req.json();
    if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Name, valid email and password of at least 8 characters are required.' }, { status: 400 });
    }
    const normalized = email.trim().toLowerCase();
    const exists = await db.user.findUnique({ where: { email: normalized } });
    if (exists) return NextResponse.json({ error: 'Account already exists. Please sign in.' }, { status: 409 });
    const selectedDepartment = ENGINEERING_CODES.includes(department) ? department : 'CSE';
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { name: name.trim(), email: normalized, passwordHash, department: selectedDepartment, targetRole: typeof targetRole === 'string' && targetRole ? targetRole : 'Software Developer' } });
    await createSession(user.id);
    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, department: user.department } });
  } catch {
    return NextResponse.json({ error: 'Unable to create account. Check the database connection.' }, { status: 500 });
  }
}
