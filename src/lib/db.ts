import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'

// Ruta a la base de datos SQLite.
// NO usar process.cwd() a ciegas: bajo Passenger cada worker puede arrancar
// con distinto cwd y terminar abriendo (o creando) otro archivo dev.db.
// 1) Si existe la ruta canónica del servidor, usarla siempre.
// 2) Si no, honrar DATABASE_URL (absoluta o relativa al cwd, p. ej. build local).
const SERVER_DB_PATH = '/home/viajeros/nodejs-app/prisma/dev.db'

function resolveDbPath(): string {
  try {
    const fs = require('node:fs')
    if (fs.existsSync(SERVER_DB_PATH)) return SERVER_DB_PATH
  } catch {
    /* ignore */
  }
  const raw = (process.env.DATABASE_URL || 'file:./prisma/dev.db')
    .trim()
    .replace(/^["']|["']$/g, '')
  const p = raw.startsWith('file:') ? raw.slice('file:'.length) : raw
  if (path.isAbsolute(p)) return p
  return path.join(process.cwd(), p)
}

const dbPath = resolveDbPath()

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
