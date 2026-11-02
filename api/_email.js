// Shared email content (used by api/subscribe.js on Vercel and by server.js locally).
// The download link comes from the DOWNLOAD_URL environment variable (Vercel > Settings > Environment Variables).
// If it is not set, the default Dropbox folder link below is used.

const DEFAULT_URL = 'https://www.dropbox.com/scl/fo/2v1fw205sximjdvmim1n9/AJ6Wq3raWt0E-k-PyvKN2UY?rlkey=szgu0vicbmn9huxz5u21fe6vk&st=h37qnlg7&dl=0';

// dl=1 makes Dropbox start the download right away (a folder link downloads as a ZIP).
function downloadUrl() {
  const raw = (process.env.DOWNLOAD_URL || DEFAULT_URL).trim();
  if (!/dropbox\.com/i.test(raw)) return raw;
  if (/[?&]dl=\d/.test(raw)) return raw.replace(/([?&])dl=\d/, '$1dl=1');
  return raw + (raw.includes('?') ? '&' : '?') + 'dl=1';
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const SUBJECT = 'Your 73 free SFX';

function emailText(url) {
  return 'Your 73 free SFX are ready.\n\nHere is your download: 73 sounds in 12 categories, ready to drop into your edit.\n\n' +
    url + '\n\nWAV, 24-bit / 96 kHz, one sound per file.\n\nPlayhead Pulse';
}

function emailHtml(url) {
  const href = esc(url);
  return `<!doctype html><html><body style="margin:0;background:#f4f4f6;font-family:Inter,Arial,sans-serif;color:#0a0a0f">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:36px">
<tr><td style="font-size:15px;font-weight:600;color:#5b2bf0">Playhead Pulse</td></tr>
<tr><td style="padding-top:18px;font-size:30px;line-height:1.05;font-weight:600;letter-spacing:-0.04em">Your 73 free SFX are ready.</td></tr>
<tr><td style="padding-top:14px;font-size:16px;line-height:1.55;color:#50505c">Here is your download: 73 sounds in 12 categories, ready to drop into your edit.</td></tr>
<tr><td style="padding-top:26px"><a href="${href}" style="display:inline-block;background:#5b2bf0;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:16px 28px;border-radius:999px">Download the pack</a></td></tr>
<tr><td style="padding-top:28px;font-size:13px;color:#8d8d99">WAV, 24-bit / 96 kHz, one sound per file.</td></tr>
<tr><td style="padding-top:14px;font-size:12px;line-height:1.5;color:#8d8d99">Button not working? Copy this link into your browser:<br><a href="${href}" style="color:#5b2bf0;word-break:break-all">${href}</a></td></tr>
</table></td></tr></table></body></html>`;
}

module.exports = { downloadUrl, emailHtml, emailText, SUBJECT };
