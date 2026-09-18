// lib/auth-cjs.js - CommonJS auth for server.js direct use
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
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
