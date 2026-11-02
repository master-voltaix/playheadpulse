(() => {
  // On localhost, Vercel and the real domain the form calls /api/subscribe (sends the email via Resend).
  // On any other host (design preview) it only plays the animation.
  const h = location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1' || h.endsWith('.vercel.app') || h === 'playheadpulse.com' || h.endsWith('.playheadpulse.com');
  const form = document.getElementById('lp-form');
  const input = document.getElementById('email');
  const btn = form.querySelector('.lp-btn');
  const label = btn.querySelector('.lp-btn__label');
  const err = document.getElementById('lp-error');
  const stepForm = document.querySelector('[data-step=form]');
  const stepSent = document.querySelector('[data-step=sent]');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Cooldown: after a send (or a server "wait") the button counts down and stays disabled
  let cdUntil = 0, cdTimer = 0, hardBlocked = false;
  const tickCooldown = () => {
    const left = Math.ceil((cdUntil - Date.now()) / 1000);
    if (left <= 0) {
      clearInterval(cdTimer); cdTimer = 0;
      btn.disabled = false; input.disabled = false; label.textContent = 'Send me the pack';
      return;
    }
    btn.disabled = true; label.textContent = 'Wait ' + left + 's';
  };
  const startCooldown = (sec) => {
    cdUntil = Date.now() + sec * 1000;
    clearInterval(cdTimer); tickCooldown();
    cdTimer = setInterval(tickCooldown, 250);
  };
  const reset = () => {
    btn.classList.remove('is-sending');
    if (hardBlocked) { btn.disabled = true; input.disabled = true; label.textContent = 'Limit reached'; return; }
    if (Date.now() < cdUntil) { input.disabled = false; startCooldown((cdUntil - Date.now()) / 1000); return; }
    btn.disabled = false; input.disabled = false; label.textContent = 'Send me the pack';
  };

  input.addEventListener('input', () => { input.classList.remove('is-bad'); err.textContent = ''; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      input.classList.add('is-bad'); err.textContent = 'Enter a valid email address.'; input.focus(); return;
    }
    err.textContent = '';
    btn.disabled = true; input.disabled = true;
    btn.classList.add('is-sending'); label.textContent = 'Sending...';
    try {
      const jobs = [wait(1400)]; // keeps the sending animation visible
      if (isLocal) {
        jobs.push(fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
          .then(async (r) => {
            const d = await r.json().catch(() => ({}));
            if (!r.ok) {
              const e = new Error(d.error || 'Something went wrong. Try again.');
              e.status = r.status; e.retryAfter = Number(d.retryAfter || 0);
              throw e;
            }
          }));
      }
      await Promise.all(jobs);
      document.getElementById('lp-addr').textContent = email;
      cdUntil = Date.now() + 60000; // matches the 60 second server cooldown
      stepForm.hidden = true; stepSent.hidden = false;
    } catch (ex) {
      err.textContent = ex.message;
      if (ex.status === 429 && ex.retryAfter > 0) cdUntil = Date.now() + ex.retryAfter * 1000;
      else if (ex.status === 429) hardBlocked = true;
      reset();
    }
  });

  document.getElementById('lp-change').addEventListener('click', () => {
    stepSent.hidden = true; stepForm.hidden = false;
    reset(); input.focus(); input.select();
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
