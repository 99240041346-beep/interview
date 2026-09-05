import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'interview-development-secret-change-me');
const COOKIE = 'interview_session';

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export async function getSessionUserId() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.userId === 'string' ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).set(COOKIE, '', { httpOnly: true, expires: new Date(0), path: '/' });
}
