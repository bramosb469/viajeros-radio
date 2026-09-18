import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

function safeStringify(obj: any) {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  );
}

export async function GET() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const client = new PrismaClient({ adapter });
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    dbPath,
    dbExists: fs.existsSync(dbPath),
    dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
  };

  try {
    const tables = await client.$queryRawUnsafe<{name: string}[]>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    results.tables = tables.map(t => t.name);
  } catch (e: any) {
    results.tablesError = e.message;
  }

  try {
    results.siteSettings = await client.siteSettings.findFirst() ? 'EXISTS' : 'EMPTY';
  } catch (e: any) {
    results.siteSettingsError = e.message;
  }

  try {
    results.menuItemCount = await client.menuItem.count();
  } catch (e: any) {
    results.menuItemError = e.message;
  }

  try {
    results.programCount = await client.program.count();
  } catch (e: any) {
    results.programError = e.message;
  }

  try {
    const programs = await client.program.findMany({ include: { schedules: true } });
    results.programs = programs;
  } catch (e: any) {
    results.programsQueryError = e.message;
  }

  try {
    results.eventCount = await client.event.count();
  } catch (e: any) {
    results.eventError = e.message;
  }

  try {
    const events = await client.event.findMany();
    results.events = events;
  } catch (e: any) {
    results.eventsQueryError = e.message;
  }

  try {
    const raw = await client.$queryRawUnsafe('SELECT id, name, active FROM Program');
    results.rawPrograms = raw;
  } catch (e: any) {
    results.rawProgramError = e.message;
  }

  try {
    const raw = await client.$queryRawUnsafe('SELECT id, title, status FROM Event');
    results.rawEvents = raw;
  } catch (e: any) {
    results.rawEventError = e.message;
  }

  await client.$disconnect();

  try {
    fs.writeFileSync(
      path.join(process.cwd(), 'debug-db.log'),
      safeStringify(results)
    );
  } catch {}

  return new NextResponse(safeStringify(results), {
    headers: { 'Content-Type': 'application/json' },
  });
}
