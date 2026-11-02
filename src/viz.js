(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Small deterministic waveform bars for the clips
  const bars = (n, seed) => {
    let s = seed, out = '';
    for (let i = 0; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      out += '<i style="--h:' + Math.round(25 + (s / 233280) * 75) + '%"></i>';
    }
    return out;
  };
  document.querySelectorAll('.lp-clip--s').forEach((c, i) => {
    c.innerHTML = '<div class="wave">' + bars(10, 3 + i * 5) + '</div>';
  });
  const music = document.querySelector('.lp-clip--m');
  if (music) music.innerHTML = '<div class="wave">' + bars(60, 17) + '</div>';

  // Cut markers sit on the same scale as the clips
  document.querySelectorAll('.lp-tl__cut').forEach((c) => {
    c.style.setProperty('--x-n', parseFloat(c.style.getPropertyValue('--x')) / 100);
  });

  // Steps: add is-in when the list scrolls into view (the theme script handles .reveal, this keeps the same class)
  // Count up the category numbers once
  const counts = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = Number(el.dataset.count);
    if (reduce) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 900;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0'; requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counts.forEach((c) => io.observe(c));
  }

  // Timeline timecode follows the playhead (same 6s loop, starts after the 0.9s intro)
  const tc = document.getElementById('tl-tc');
  const tl = document.querySelector('.lp-tl');
  if (tc && tl && !reduce) {
    const pad = (n) => String(n).padStart(2, '0');
    let t0 = 0, on = false;
    const frame = (now) => {
      if (!on) return;
      if (!t0) t0 = now;
      const t = Math.max(0, (now - t0) / 1000 - 0.9);
      const x = (t % 6) / 6;
      const total = Math.floor(x * 15 * 24); // 15 second reel at 24 fps
      tc.textContent = '00:' + pad(Math.floor(total / 24)) + ':' + pad(total % 24);
      requestAnimationFrame(frame);
    };
    new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting;
      if (vis && !on) { on = true; t0 = 0; requestAnimationFrame(frame); }
      if (!vis) on = false;
    }).observe(tl);
  }
})();
