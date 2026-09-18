import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: { active: true },
      include: { schedules: true },
    });
    
    const events = await prisma.event.findMany({
      where: { status: 'publicado' },
    });
    
    return NextResponse.json({ programs: programs.length, events: events.length, programsData: programs });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
