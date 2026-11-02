// Local dev server: serves index.html and sends the email through Resend.
// Run: node server.js   (needs Node 18+, no packages)
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  });
} catch (e) { /* no .env */ }

const PORT = Number(process.env.PORT || 5173);
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.FROM_EMAIL || 'Playhead Pulse <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const { downloadUrl, emailHtml, emailText, SUBJECT } = require('./api/_email');

async function sendEmail(to) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: SUBJECT,
      html: emailHtml(downloadUrl()),
      text: emailText(downloadUrl())
    })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'POST' && url === '/api/subscribe') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 10000) req.destroy(); });
    req.on('end', async () => {
      let email = '';
      try { email = String(JSON.parse(body).email || '').trim(); } catch (e) { /* bad json */ }
      if (!EMAIL_RE.test(email)) return json(res, 400, { error: 'Enter a valid email address.' });
      if (!KEY) return json(res, 500, { error: 'Server has no RESEND_API_KEY.' });
      try {
        const r = await sendEmail(email);
        if (!r.ok) {
          console.error('Resend error', r.status, r.data);
          return json(res, 502, { error: (r.data && r.data.message) || 'Could not send the email.' });
        }
        console.log('Test email sent to', email, 'id', r.data.id);
        json(res, 200, { ok: true });
      } catch (e) {
        console.error(e);
        json(res, 502, { error: 'Could not reach Resend.' });
      }
    });
    return;
  }

  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) { res.writeHead(500); return res.end('index.html missing. Run: python build.py'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
}).listen(PORT, '127.0.0.1', () => console.log('http://localhost:' + PORT));
