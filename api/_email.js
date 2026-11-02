// Shared email content (used by api/subscribe.js on Vercel and by server.js locally).
// DOWNLOAD_URL  link to the free pack (optional, a default Dropbox link is built in)
// SITE_URL      where the logo is hosted, e.g. https://playheadpulse.com (default: the Vercel address)

const DEFAULT_URL = 'https://www.dropbox.com/scl/fo/2v1fw205sximjdvmim1n9/AJ6Wq3raWt0E-k-PyvKN2UY?rlkey=szgu0vicbmn9huxz5u21fe6vk&st=h37qnlg7&dl=0';
const DEFAULT_SITE = 'https://playheadpulse.vercel.app';

// dl=1 makes Dropbox start the download right away (a folder link downloads as a ZIP).
function downloadUrl() {
  const raw = (process.env.DOWNLOAD_URL || DEFAULT_URL).trim();
  if (!/dropbox\.com/i.test(raw)) return raw;
  if (/[?&]dl=\d/.test(raw)) return raw.replace(/([?&])dl=\d/, '$1dl=1');
  return raw + (raw.includes('?') ? '&' : '?') + 'dl=1';
}

const siteUrl = () => (process.env.SITE_URL || DEFAULT_SITE).replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const SUBJECT = 'Your 73 free SFX are ready';

function emailText(url) {
  return [
    'Your 73 free sound effects.',
    'Trimmed to the frame and ready for your next edit.',
    '',
    'Download the pack:',
    url,
    '',
    '73 sounds, 12 categories, WAV 24-bit / 96 kHz.',
    'Unzip, import, drag onto your timeline.',
    '',
    'You received this email because you requested the free pack at playheadpulse.com.',
    'Playhead Pulse'
  ].join('\n');
}

const stat = (big, small, last) => `<td width="33.33%" valign="top" style="padding:20px 8px 20px 20px${last ? '' : ''};font-family:inherit">
<div style="font-size:30px;line-height:32px;font-weight:700;letter-spacing:-0.04em;color:#0a0a0f">${big}</div>
<div style="font-size:12px;line-height:17px;color:#8d8d99;padding-top:4px">${small}</div></td>`;

function emailHtml(url, base) {
  const href = esc(url);
  const logo = (base || siteUrl()) + '/email-assets/logo.png';
  const font = "Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${SUBJECT}</title>
<style>
  body { margin:0; padding:0; background:#f4f4f6; }
  a { text-decoration:none; }
  @media (max-width: 520px) {
    .pad { padding-left:24px !important; padding-right:24px !important; }
    .h1 { font-size:34px !important; line-height:37px !important; }
    .btn a { display:block !important; text-align:center !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:${font}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">Your download is inside. 73 sounds, trimmed to the frame.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6"><tr><td align="center" style="padding:24px 12px 36px">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:28px;font-family:${font}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

        <tr><td class="pad" style="padding:36px 40px 0 40px"><img src="${logo}" width="140" height="20" alt="Playhead Pulse" style="display:block;border:0;height:20px;width:140px;font-size:15px;font-weight:700;color:#0a0a0f"></td></tr>

        <tr><td class="pad" style="padding:48px 40px 0 40px;font-size:14px;line-height:20px;font-weight:600;color:#5b2bf0">Free download</td></tr>

        <tr><td class="pad" style="padding:10px 40px 0 40px">
          <div class="h1" style="font-size:42px;line-height:44px;font-weight:700;letter-spacing:-0.045em;color:#0a0a0f">Your 73 free<br>sound effects.</div>
        </td></tr>

        <tr><td class="pad" style="padding:16px 40px 0 40px;font-size:17px;line-height:26px;color:#50505c">Trimmed to the frame and ready for your next edit.</td></tr>

        <tr><td class="pad btn" style="padding:30px 40px 0 40px">
          <a href="${href}" style="display:inline-block;background:#5b2bf0;color:#ffffff;font-family:${font};font-size:16px;line-height:20px;font-weight:700;padding:18px 32px;border-radius:999px">Download the pack &nbsp;&rarr;</a>
        </td></tr>

        <tr><td class="pad" style="padding:36px 40px 0 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f6" style="background:#f4f4f6;border-radius:18px;font-family:${font}"><tr>
            ${stat('73', 'Sounds')}${stat('12', 'Categories')}${stat('WAV', '24-bit audio')}
          </tr></table>
        </td></tr>

        <tr><td class="pad" style="padding:22px 40px 0 40px;font-size:14px;line-height:22px;color:#50505c">96 kHz, cut tight so every sound lands on the frame. Unzip, import, drag onto your timeline.</td></tr>

        <tr><td class="pad" style="padding:34px 40px 36px 40px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="1" bgcolor="#ebebef" style="background:#ebebef;font-size:0;line-height:0">&nbsp;</td></tr></table>
          <div style="padding-top:18px;font-size:12px;line-height:19px;color:#8d8d99">Button not working? Copy this link into your browser:<br><a href="${href}" style="color:#5b2bf0;word-break:break-all">${href}</a></div>
        </td></tr>

      </table>
    </td></tr>

    <tr><td class="pad" align="center" style="padding:20px 24px 0 24px;font-family:${font};font-size:12px;line-height:19px;color:#8d8d99">
      You received this email because you requested the free pack at playheadpulse.com.<br>&copy; Playhead Pulse
    </td></tr>
  </table>

</td></tr></table>
</body></html>`;
}

module.exports = { downloadUrl, emailHtml, emailText, SUBJECT };
