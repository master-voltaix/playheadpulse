# Playhead Pulse free SFX landing page

Single page (`index.html`) plus one serverless function (`api/subscribe.js`) that sends the email through Resend.

## Edit the page
Edit files in `src/`, then run `python build.py` to rebuild `index.html`.

## Run locally
Copy `.env.example` to `.env`, fill in the values, then `node server.js` and open http://localhost:5173

## Deploy (Vercel)
Import this repo in Vercel (no build command, no framework). Add these environment variables:
- `RESEND_API_KEY`
- `FROM_EMAIL` (for example `Playhead Pulse <hello@playheadpulse.com>`, domain verified in Resend)
