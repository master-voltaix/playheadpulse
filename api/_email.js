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
    'Your 73 free SFX.',
    'Trimmed to the frame. Drop them in and go.',
    '',
    'Download the pack:',
    url,
    '',
    '73 sounds in 12 categories. WAV, 24-bit / 96 kHz, one sound per file.',
    '',
    '1. Download and unzip',
    '2. Import into your editor',
    '3. Drag onto your timeline',
    '',
    'You received this email because you requested the free pack at playheadpulse.com.',
    'Playhead Pulse'
  ].join('\n');
}

// Static sound spectrum built from table cells, so it shows in every email app without images.
const BAR_HEIGHTS = [16, 24, 20, 32, 26, 38, 50, 42, 58, 46, 68, 56, 82, 66, 94, 76, 104, 88, 78, 64, 56, 70, 50, 42, 56, 38, 46, 32, 40, 28, 34, 24, 30, 22, 26, 16];
function bars() {
  const peak = BAR_HEIGHTS.indexOf(Math.max(...BAR_HEIGHTS));
  return BAR_HEIGHTS.map((h, i) => {
    const d = Math.abs(i - peak);
    const color = d === 0 ? '#ece6ff' : d <= 2 ? '#8a63ff' : d <= 5 ? '#6a3df5' : '#5b2bf0';
    return `<td valign="bottom" style="padding:0 1px"><div style="height:${h}px;background:${color};border-radius:3px 3px 0 0;font-size:0;line-height:0">&nbsp;</div></td>`;
  }).join('');
}

const pill = (t) => `<span style="display:inline-block;background:#17171f;color:#d2d2dc;font-size:13px;line-height:18px;padding:7px 13px;border-radius:999px;margin:0 6px 8px 0">${t}</span>`;

const step = (n, title, text) => `<tr>
<td width="44" valign="top" style="padding:0 0 18px 0"><div style="width:34px;height:34px;line-height:34px;border-radius:50%;background:#ece6ff;color:#5b2bf0;font-size:15px;font-weight:700;text-align:center">${n}</div></td>
<td valign="top" style="padding:0 0 18px 0"><div style="font-size:16px;line-height:22px;font-weight:700;color:#0a0a0f">${title}</div><div style="font-size:14px;line-height:21px;color:#50505c;padding-top:2px">${text}</div></td>
</tr>`;

function emailHtml(url, base) {
  const href = esc(url);
  const logo = (base || siteUrl()) + '/email-assets/logo-light.png';
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
    .pad { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:38px !important; line-height:40px !important; }
    .btn a { display:block !important; text-align:center !important; }
    .bars td { padding:0 .5px !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:${font}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">Your download is inside. 73 sounds, trimmed to the frame.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6"><tr><td align="center" style="padding:20px 12px 32px">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

    <!-- hero -->
    <tr><td bgcolor="#000000" style="background:#000000;border-radius:28px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td class="pad" style="padding:30px 36px 0 36px"><img src="${logo}" width="168" height="24" alt="Playhead Pulse" style="display:block;border:0;height:24px;width:168px;color:#ffffff;font-size:16px;font-weight:700"></td></tr>
        <tr><td class="pad" style="padding:44px 36px 0 36px">
          <span style="display:inline-block;background:#17171f;color:#b7a3ff;font-size:13px;line-height:18px;font-weight:600;padding:6px 13px;border-radius:999px">Free download</span>
        </td></tr>
        <tr><td class="pad" style="padding:20px 36px 0 36px;font-family:${font}">
          <div class="h1" style="font-size:52px;line-height:52px;font-weight:700;letter-spacing:-0.045em;color:#ffffff">Your 73<br>free SFX.</div>
          <div style="font-size:17px;line-height:26px;color:#a5a5b2;padding-top:18px;max-width:380px">Trimmed to the frame. Drop them in and go.</div>
        </td></tr>
        <tr><td class="pad btn" style="padding:30px 36px 0 36px">
          <a href="${href}" style="display:inline-block;background:#5b2bf0;color:#ffffff;font-family:${font};font-size:17px;line-height:20px;font-weight:700;padding:18px 34px;border-radius:999px">Download the pack &nbsp;&rarr;</a>
        </td></tr>
        <tr><td class="pad" style="padding:30px 36px 0 36px">
          ${pill('73 sounds')}${pill('12 categories')}${pill('WAV')}${pill('24-bit / 96 kHz')}
        </td></tr>
        <tr><td style="padding:18px 28px 0 28px">
          <table class="bars" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="height:108px"><tr>${bars()}</tr></table>
        </td></tr>
        <tr><td height="28" style="font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td></tr>

    <tr><td height="12" style="font-size:0;line-height:0">&nbsp;</td></tr>

    <!-- how to -->
    <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td class="pad" style="padding:34px 36px 8px 36px;font-family:${font}">
          <div style="font-size:26px;line-height:28px;font-weight:700;letter-spacing:-0.035em;color:#0a0a0f">Drop it in and go.</div>
        </td></tr>
        <tr><td class="pad" style="padding:18px 36px 6px 36px;font-family:${font}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${step(1, 'Download and unzip', 'One ZIP with 12 folders.')}
            ${step(2, 'Import into your editor', 'Premiere, Final Cut, Resolve, CapCut.')}
            ${step(3, 'Drag onto your timeline', 'Every sound is cut to the frame.')}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- footer -->
    <tr><td class="pad" align="center" style="padding:24px 24px 0 24px;font-family:${font};font-size:12px;line-height:19px;color:#8d8d99">
      Button not working? Copy this link into your browser:<br>
      <a href="${href}" style="color:#5b2bf0;word-break:break-all">${href}</a>
      <div style="padding-top:16px">You received this email because you requested the free pack at playheadpulse.com.</div>
      <div style="padding-top:6px;color:#8d8d99">&copy; Playhead Pulse</div>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}

module.exports = { downloadUrl, emailHtml, emailText, SUBJECT };
