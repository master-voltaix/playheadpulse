// Vercel serverless function: POST /api/subscribe  { "email": "..." }
// Sends the download email through Resend.
// Environment variables (set in Vercel > Settings > Environment Variables):
//   RESEND_API_KEY   your Resend key
//   FROM_EMAIL       e.g. Playhead Pulse <hello@playheadpulse.com>  (domain must be verified in Resend)
//   DOWNLOAD_URL     link to the free pack (optional, a default Dropbox link is built in)

const { downloadUrl, emailHtml, emailText, SUBJECT } = require('./_email');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Saves the address in Postgres (Neon via Vercel Storage). Skipped if no database is connected.
// Never throws: a database problem must not stop the email from being sent.
async function saveSubscriber(email) {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) { console.warn('No DATABASE_URL, email not saved.'); return; }
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(url);
    await sql`CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    await sql`INSERT INTO subscribers (email) VALUES (${email.toLowerCase()}) ON CONFLICT (email) DO NOTHING`;
  } catch (e) {
    console.error('Could not save subscriber', e);
  }
}

// Spam limits (counted in Postgres, per device = IP address):
//  - 60 second cooldown for the same device and for the same email
//  - max 3 requests per email in 24 hours
//  - max 3 different emails per device in 24 hours
// Returns null if allowed (and records the attempt), or { error, retryAfter } if blocked.
// If the database is unavailable the request is allowed, so a database problem never blocks real users.
const COOLDOWN_SEC = 60;
const MAX_PER_EMAIL = 3;
const MAX_EMAILS_PER_DEVICE = 3;

async function checkLimits(email, ip) {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(url);
    await sql`CREATE TABLE IF NOT EXISTS signup_attempts (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      ip TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

    // 1. cooldown: last attempt from this device or for this email
    const last = await sql`SELECT EXTRACT(EPOCH FROM (now() - max(created_at))) AS age
      FROM signup_attempts WHERE (ip = ${ip} OR email = ${email}) AND created_at > now() - interval '60 seconds'`;
    const age = last[0] && last[0].age !== null ? Number(last[0].age) : null;
    if (age !== null) {
      return { error: 'Please wait a moment before trying again.', retryAfter: Math.max(1, Math.ceil(COOLDOWN_SEC - age)) };
    }

    // 2. same email too often
    const perEmail = await sql`SELECT count(*)::int AS n FROM signup_attempts WHERE email = ${email} AND created_at > now() - interval '24 hours'`;
    if (perEmail[0].n >= MAX_PER_EMAIL) {
      return { error: 'This email already received the pack 3 times. Check your inbox and spam folder.', retryAfter: 0 };
    }

    // 3. one device, too many different emails
    const perDevice = await sql`SELECT count(DISTINCT email)::int AS n FROM signup_attempts WHERE ip = ${ip} AND created_at > now() - interval '24 hours'`;
    const known = await sql`SELECT 1 FROM signup_attempts WHERE ip = ${ip} AND email = ${email} AND created_at > now() - interval '24 hours' LIMIT 1`;
    if (perDevice[0].n >= MAX_EMAILS_PER_DEVICE && known.length === 0) {
      return { error: 'Too many requests from this device. Try again tomorrow.', retryAfter: 0 };
    }

    await sql`INSERT INTO signup_attempts (email, ip) VALUES (${email}, ${ip})`;
    return null;
  } catch (e) {
    console.error('Limit check failed, allowing request', e);
    return null;
  }
}

// Also adds the address to Resend Contacts so it shows up in the Resend dashboard.
// Needs an API key with "Full access". Never throws: the email has already been sent.
async function saveContact(email, key) {
  try {
    const r = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), unsubscribed: false })
    });
    if (!r.ok) console.error('Could not save Resend contact', r.status, await r.text().catch(() => ''));
  } catch (e) {
    console.error('Could not save Resend contact', e);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const email = String((body && body.email) || '').trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server has no RESEND_API_KEY.' });

  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const blocked = await checkLimits(email.toLowerCase(), ip);
  if (blocked) {
    if (blocked.retryAfter) res.setHeader('Retry-After', String(blocked.retryAfter));
    return res.status(429).json({ error: blocked.error, retryAfter: blocked.retryAfter || 0 });
  }

  await saveSubscriber(email);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Playhead Pulse <onboarding@resend.dev>',
        to: [email],
        subject: SUBJECT,
        html: emailHtml(downloadUrl()),
        text: emailText(downloadUrl())
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Resend error', r.status, data);
      return res.status(502).json({ error: data.message || 'Could not send the email.' });
    }
    await saveContact(email, key);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not reach Resend.' });
  }
};
