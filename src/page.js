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

  const reset = () => {
    btn.disabled = false; input.disabled = false;
    btn.classList.remove('is-sending'); label.textContent = 'Send me the pack';
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
            if (!r.ok) throw new Error(d.error || 'Something went wrong. Try again.');
          }));
      }
      await Promise.all(jobs);
      document.getElementById('lp-addr').textContent = email;
      stepForm.hidden = true; stepSent.hidden = false;
    } catch (ex) {
      err.textContent = ex.message;
      reset();
    }
  });

  document.getElementById('lp-change').addEventListener('click', () => {
    stepSent.hidden = true; stepForm.hidden = false;
    reset(); input.focus(); input.select();
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
