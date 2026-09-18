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

    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, () => {
    console.log('> Ready on port ' + (process.env.PORT || 3000));
  });
});
