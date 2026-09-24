// server.js - Entry point para cPanel Node.js (Phusion Passenger)
process.env.NODE_ENV = 'production';

// Load .env file manually (custom server doesn't auto-load it)
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

// Fix BigInt serialization for JSON responses (Prisma + SQLite)
BigInt.prototype.toJSON = function () {
  return Number(this);
};

// Auto-respaldo de la DB al iniciar (defensa ante reemplazos externos del
// archivo dev.db): si no hay ningún respaldo de los últimos 30 minutos,
// copiar la DB actual a prisma/backups/. Aparecen en Panel → Ajustes → Respaldos.
try {
  const adbPath = path.join(__dirname, 'prisma', 'dev.db');
  const abDir = '/home/viajeros/db-backups';
  if (fs.existsSync(adbPath)) {
    fs.mkdirSync(abDir, { recursive: true });
    const limit = Date.now() - 30 * 60 * 1000;
    const hasRecent = fs.readdirSync(abDir).some((n) => {
      if (!/^dev-\d{14}\.db$/.test(n)) return false;
      try { return fs.statSync(path.join(abDir, n)).mtimeMs > limit; }
      catch (e) { return false; }
    });
    if (!hasRecent) {
      const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      fs.copyFileSync(adbPath, path.join(abDir, 'dev-' + stamp + '.db'));
      console.log('[server.js] Auto-backup DB creado');
    }
  }
} catch (e) { console.error('[server.js] Auto-backup error:', e.message); }

const next = require('next');
const app = next({ dev: false });
const handle = app.getRequestHandler();
const http = require('http');
const url = require('url');

let authHandler = null;
let authApi = null;

try {
  const { auth } = require('./lib/auth-cjs');
  authHandler = auth.handler;
  authApi = auth.api;
  console.log('[server.js] Auth handler loaded');
} catch (e) {
  console.error('[server.js] Auth load error:', e.message);
}

app.prepare().then(() => {
  http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname.startsWith('/api/auth/') && (authHandler || authApi)) {
      try {
        const proto = 'https';
        const host = req.headers.host || 'localhost';

        const headers = new Headers();
        for (const [key, val] of Object.entries(req.headers)) {
          if (val) headers.set(key, Array.isArray(val) ? val.join(', ') : val);
        }
        if (!headers.has('origin')) {
          headers.set('origin', `${proto}://${host}`);
        }

        // For session endpoint, use auth.api.getSession() directly
        // auth.handler doesn't expose GET /api/auth/session properly
        if (parsedUrl.pathname === '/api/auth/session' && authApi) {
          try {
            const session = await authApi.getSession({ headers });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(session || { session: null, user: null }));
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ session: null, user: null }));
          }
          return;
        }

        // For all other auth routes (sign-in, sign-out, etc.), use auth.handler
        if (authHandler) {
          const fullUrl = `${proto}://${host}${req.url}`;

          const body = (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')
            ? await new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', c => chunks.push(c));
                req.on('end', () => resolve(Buffer.concat(chunks).toString()));
                req.on('error', reject);
              })
            : undefined;

          try {
            fs.appendFileSync(
              path.join(__dirname, 'auth-debug.log'),
              new Date().toISOString() + ' ' + req.method + ' ' + parsedUrl.pathname +
              ' ct=' + req.headers['content-type'] + ' cl=' + req.headers['content-length'] +
              ' te=' + req.headers['transfer-encoding'] +
              ' bodylen=' + (body ? body.length : 0) +
              ' body=' + JSON.stringify((body || '').slice(0, 150)) + '\n'
            );
          } catch (e) { /* ignore */ }

          const request = new Request(fullUrl, {
            method: req.method,
            headers,
            body: body || undefined,
          });

          const result = await authHandler(request);
          res.writeHead(result.status, Object.fromEntries(result.headers.entries()));
          res.end(await result.text());
          return;
        }
      } catch (e) {
        console.error('[auth error]', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    // Backup / restore de la base SQLite (solo admin).
    // Se maneja acá (no en un Route Handler) para poder validar la
    // sesión con authApi, igual que /api/auth/session.
    if (parsedUrl.pathname.startsWith('/api/backup/')) {
      try {
        const bHeaders = new Headers();
        for (const [key, val] of Object.entries(req.headers)) {
          if (val) bHeaders.set(key, Array.isArray(val) ? val.join(', ') : val);
        }
        let bSession = null;
        try {
          if (authApi) bSession = await authApi.getSession({ headers: bHeaders });
        } catch (e) { bSession = null; }
        if (!bSession || !bSession.user || bSession.user.role !== 'admin') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No autorizado' }));
          return;
        }

        const backupDir = '/home/viajeros/db-backups';
        const dbPath = path.join(__dirname, 'prisma', 'dev.db');
        const nameOk = (n) => /^dev-\d{14}\.db$/.test(n || '');
        const listBackups = () => {
          if (!fs.existsSync(backupDir)) return [];
          return fs.readdirSync(backupDir)
            .filter(nameOk)
            .map((name) => {
              const st = fs.statSync(path.join(backupDir, name));
              return { name, size: st.size, mtime: st.mtime.toISOString() };
            })
            .sort((a, b) => (a.name < b.name ? 1 : -1));
        };
        const readJsonBody = () => new Promise((resolve, reject) => {
          const chunks = [];
          req.on('data', (c) => chunks.push(c));
          req.on('end', () => {
            try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
            catch (e) { reject(e); }
          });
          req.on('error', reject);
        });
        const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

        if (parsedUrl.pathname === '/api/backup/list' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ backups: listBackups() }));
          return;
        }

        if (parsedUrl.pathname === '/api/backup/create' && req.method === 'POST') {
          fs.mkdirSync(backupDir, { recursive: true });
          const name = 'dev-' + stamp() + '.db';
          fs.copyFileSync(dbPath, path.join(backupDir, name));
          listBackups().slice(10).forEach((b) => {
            try { fs.unlinkSync(path.join(backupDir, b.name)); } catch (e) { /* ignore */ }
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, name }));
          return;
        }

        if (parsedUrl.pathname === '/api/backup/download' && req.method === 'GET') {
          const name = parsedUrl.query.name;
          if (!nameOk(name)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre inválido' }));
            return;
          }
          const p = path.join(backupDir, name);
          if (!fs.existsSync(p)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No encontrado' }));
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename="' + name + '"',
            'Content-Length': String(fs.statSync(p).size),
          });
          fs.createReadStream(p).pipe(res);
          return;
        }

        if (parsedUrl.pathname === '/api/backup/restore' && req.method === 'POST') {
          const bbody = await readJsonBody();
          const name = bbody && bbody.name;
          if (!nameOk(name)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre inválido' }));
            return;
          }
          const p = path.join(backupDir, name);
          if (!fs.existsSync(p)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No encontrado' }));
            return;
          }
          fs.mkdirSync(backupDir, { recursive: true });
          try {
            if (fs.existsSync(dbPath)) {
              fs.copyFileSync(dbPath, path.join(backupDir, 'dev-' + stamp() + '.db'));
            }
          } catch (e) { /* ignore */ }
          fs.copyFileSync(p, dbPath);
          try {
            fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });
            fs.writeFileSync(path.join(__dirname, 'tmp', 'restart.txt'), String(Date.now()));
          } catch (e) { /* ignore */ }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        if (parsedUrl.pathname === '/api/backup/delete' && req.method === 'POST') {
          const bbody = await readJsonBody();
          const name = bbody && bbody.name;
          if (!nameOk(name)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre inválido' }));
            return;
          }
          try { fs.unlinkSync(path.join(backupDir, name)); } catch (e) { /* ignore */ }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No encontrado' }));
        return;
      } catch (e) {
        console.error('[backup error]', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    if (parsedUrl.pathname.startsWith('/admin')) {
      try {
        fs.appendFileSync(
          path.join(__dirname, 'admin-debug.log'),
          new Date().toISOString() + ' ' + req.method + ' url=' + req.url + ' pathname=' + parsedUrl.pathname + ' host=' + (req.headers.host || '') + '\n'
        );
      } catch (e) { /* ignore */ }
    }

    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, () => {
    console.log('> Ready on port ' + (process.env.PORT || 3000));
  });
});
