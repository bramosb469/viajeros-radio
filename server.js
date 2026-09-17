// server.js - Entry point para cPanel Node.js (Phusion Passenger)
process.env.NODE_ENV = 'production';

const next = require('next');
const app = next({ dev: false });
const handle = app.getRequestHandler();
const http = require('http');
const url = require('url');

app.prepare().then(() => {
  http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT || 3000, () => {
    console.log('> Ready on port ' + (process.env.PORT || 3000));
  });
});