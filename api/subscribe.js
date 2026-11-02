// Vercel serverless function: POST /api/subscribe  { "email": "..." }
// Sends the download email through Resend.
// Environment variables (set in Vercel > Settings > Environment Variables):
//   RESEND_API_KEY   your Resend key
//   FROM_EMAIL       e.g. Playhead Pulse <hello@playheadpulse.com>  (domain must be verified in Resend)

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

const emailHtml = () => `<!doctype html><html><body style="margin:0;background:#f4f4f6;font-family:Inter,Arial,sans-serif;color:#0a0a0f">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:36px">
<tr><td style="font-size:15px;font-weight:600;color:#5b2bf0">Playhead Pulse</td></tr>
<tr><td style="padding-top:18px;font-size:30px;line-height:1.05;font-weight:600;letter-spacing:-0.04em">Your 50 free SFX are ready.</td></tr>
<tr><td style="padding-top:14px;font-size:16px;line-height:1.55;color:#50505c">This is a test email from your landing page. In the live version, this email contains the download link to your free pack.</td></tr>
<tr><td style="padding-top:26px"><a href="#" style="display:inline-block;background:#5b2bf0;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px">Download the pack</a></td></tr>
<tr><td style="padding-top:28px;font-size:13px;color:#8d8d99">WAV, 24-bit / 96 kHz, one sound per file.</td></tr>
</table></td></tr></table></body></html>`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const email = String((body && body.email) || '').trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server has no RESEND_API_KEY.' });

  await saveSubscriber(email);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Playhead Pulse <onboarding@resend.dev>',
        to: [email],
        subject: 'Your 50 free SFX',
        html: emailHtml(),
        text: 'Your 50 free SFX are ready.'
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Resend error', r.status, data);
      return res.status(502).json({ error: data.message || 'Could not send the email.' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Could not reach Resend.' });
  }
};
