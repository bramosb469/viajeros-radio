import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasSecret = !!process.env.BETTER_AUTH_SECRET;
  const hasUrl = !!process.env.BETTER_AUTH_URL;
  const hasDbUrl = !!process.env.DATABASE_URL;
  const authType = typeof auth;
  const handlerType = typeof auth.handler;
  return NextResponse.json({
    hasSecret,
    hasUrl,
    hasDbUrl,
    authType,
    handlerType,
  });
}
