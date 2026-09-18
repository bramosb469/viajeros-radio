// lib/auth.cjs - CommonJS auth module for direct use in server.js
// Avoids Turbopack's broken async module system for catch-all routes

const path = require('path');

// Ensure prisma client is generated
try {
  require('@prisma/client');
} catch (e) {
  console.error('[auth.cjs] Prisma client not found:', e.message);
}

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { betterAuth } = require('better-auth');

function createAuth() {
  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    database: require('better-auth/adapters/prisma').prismaAdapter(prisma, {
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
}

let _auth = null;
function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth;
}

module.exports = { getAuth };
