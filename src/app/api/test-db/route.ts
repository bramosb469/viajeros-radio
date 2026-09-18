import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import fs from 'fs';
import { prisma as sharedPrisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function bigIntReplacer(_key: string, value: any) {
  if (typeof value === 'bigint') return Number(value);
  return value;
}

export async function GET() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    dbPath,
    dbExists: fs.existsSync(dbPath),
    dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
  };

  // Test with FRESH PrismaClient
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const freshPrisma = new PrismaClient({ adapter });

  try {
    results.fresh_programCount = await freshPrisma.program.count();
  } catch (e: any) {
    results.fresh_programError = e.message;
  }

  try {
    const programs = await freshPrisma.program.findMany({ include: { schedules: true } });
    results.fresh_programs = programs;
  } catch (e: any) {
    results.fresh_programsError = e.message;
  }

  try {
    results.fresh_eventCount = await freshPrisma.event.count();
  } catch (e: any) {
    results.fresh_eventError = e.message;
  }

  try {
    const events = await freshPrisma.event.findMany();
    results.fresh_events = events;
  } catch (e: any) {
    results.fresh_eventsError = e.message;
  }

  try {
    results.fresh_siteSettings = await freshPrisma.siteSettings.findFirst() ? 'EXISTS' : 'EMPTY';
  } catch (e: any) {
    results.fresh_siteSettingsError = e.message;
  }

  try {
    results.fresh_menuItemCount = await freshPrisma.menuItem.count();
  } catch (e: any) {
    results.fresh_menuItemError = e.message;
  }

  await freshPrisma.$disconnect();

  // Test with SHARED singleton
  try {
    results.shared_programCount = await sharedPrisma.program.count();
  } catch (e: any) {
    results.shared_programError = e.message;
  }

  try {
    const programs = await sharedPrisma.program.findMany({ include: { schedules: true } });
    results.shared_programs = programs;
  } catch (e: any) {
    results.shared_programsError = e.message;
  }

  try {
    results.shared_eventCount = await sharedPrisma.event.count();
  } catch (e: any) {
    results.shared_eventError = e.message;
  }

  try {
    results.shared_events = await sharedPrisma.event.findMany();
  } catch (e: any) {
    results.shared_eventsError = e.message;
  }

  try {
    results.shared_siteSettings = await sharedPrisma.siteSettings.findFirst() ? 'EXISTS' : 'EMPTY';
  } catch (e: any) {
    results.shared_siteSettingsError = e.message;
  }

  try {
    results.shared_menuItemCount = await sharedPrisma.menuItem.count();
  } catch (e: any) {
    results.shared_menuItemError = e.message;
  }

  // Raw SQL test
  try {
    const raw = await freshPrisma.$queryRawUnsafe('SELECT id, name, active FROM Program');
    results.rawPrograms = raw;
  } catch (e: any) {
    results.rawProgramError = e.message;
  }

  try {
    const raw = await freshPrisma.$queryRawUnsafe('SELECT id, title, status FROM Event');
    results.rawEvents = raw;
  } catch (e: any) {
    results.rawEventError = e.message;
  }

  // Write log file
  try {
    fs.writeFileSync(
      path.join(process.cwd(), 'debug-db.log'),
      JSON.stringify(results, null, 2, bigIntReplacer)
    );
  } catch {}

  return new NextResponse(JSON.stringify(results, bigIntReplacer), {
    headers: { 'Content-Type': 'application/json' },
  });
}
