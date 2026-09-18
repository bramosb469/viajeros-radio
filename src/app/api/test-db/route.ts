import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    dbPath,
    dbExists: fs.existsSync(dbPath),
    dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
  };

  try {
    const tables = await prisma.$queryRawUnsafe<{name: string}[]>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    results.tables = tables.map(t => t.name);
  } catch (e: any) {
    results.tablesError = e.message;
  }

  try {
    const count = await prisma.siteSettings.findFirst();
    results.siteSettings = count ? 'EXISTS' : 'EMPTY';
  } catch (e: any) {
    results.siteSettingsError = e.message;
  }

  try {
    const count = await prisma.menuItem.count();
    results.menuItemCount = count;
  } catch (e: any) {
    results.menuItemError = e.message;
  }

  try {
    const count = await prisma.program.count();
    results.programCount = count;
  } catch (e: any) {
    results.programError = e.message;
  }

  try {
    const programs = await prisma.program.findMany({ include: { schedules: true } });
    results.programs = programs;
  } catch (e: any) {
    results.programsQueryError = e.message;
  }

  try {
    const count = await prisma.event.count();
    results.eventCount = count;
  } catch (e: any) {
    results.eventError = e.message;
  }

  try {
    const events = await prisma.event.findMany();
    results.events = events;
  } catch (e: any) {
    results.eventsQueryError = e.message;
  }

  try {
    const raw = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM Program');
    results.rawProgramCount = raw;
  } catch (e: any) {
    results.rawProgramError = e.message;
  }

  try {
    const raw = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM Event');
    results.rawEventCount = raw;
  } catch (e: any) {
    results.rawEventError = e.message;
  }

  await prisma.$disconnect();

  try {
    fs.writeFileSync(path.join(process.cwd(), 'debug-db.log'), JSON.stringify(results, null, 2));
  } catch {}

  return NextResponse.json(results);
}
