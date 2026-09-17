// server.js - Entry point para cPanel Node.js (Phusion Passenger)
process.env.NODE_ENV = 'production';

const next = require('next');
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const http = require('http');
  const { parse } = require('url');
  http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, () => {
    console.log('> Ready on port ' + (process.env.PORT || 3000));
  });
});