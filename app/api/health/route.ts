import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){try{await db.$queryRaw`SELECT 1`;return NextResponse.json({ok:true,service:'INTERVIEW',database:'connected',timestamp:new Date().toISOString()});}catch{return NextResponse.json({ok:false,service:'INTERVIEW',database:'unavailable',timestamp:new Date().toISOString()},{status:503});}}
