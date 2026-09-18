const path = require('path');
process.env.DATABASE_URL = "file:" + path.join(__dirname, 'prisma', 'dev.db');

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const EMAIL = "viajerosdelfolklore@hotmail.com";
const PASSWORD = "Viajerosradio21";

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: EMAIL } });
  if (existing) {
    console.log("Admin ya existe:", EMAIL);
    process.exit(0);
  }

  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(PASSWORD, salt, 64).toString('hex') + ':' + salt;

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      name: "Administrador",
      role: "admin",
      emailVerified: true,
    }
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: EMAIL,
      providerId: "credential",
      password: hash,
    }
  });

  console.log("Admin creado:", EMAIL);
}

main().finally(() => process.exit(0));
