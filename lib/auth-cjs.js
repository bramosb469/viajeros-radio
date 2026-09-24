// lib/auth-cjs.js - CommonJS auth for server.js direct use
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');

// Misma resolución determinística que src/lib/db.ts: nunca depender del cwd.
const SERVER_DB_PATH = '/home/viajeros/nodejs-app/prisma/dev.db';
function resolveDbPath() {
  try {
    if (fs.existsSync(SERVER_DB_PATH)) return SERVER_DB_PATH;
  } catch (e) { /* ignore */ }
  const raw = String(process.env.DATABASE_URL || 'file:./prisma/dev.db').trim().replace(/^["']|["']$/g, '');
  const p = raw.indexOf('file:') === 0 ? raw.slice(5) : raw;
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}
const dbPath = resolveDbPath();
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});

module.exports = { auth };
