(() => {
  const stage = document.getElementById('viz-stage');
  if (!stage) return;
  const barsEl = document.getElementById('viz-bars');
  const ph = document.getElementById('viz-ph');
  const tagsEl = document.getElementById('viz-tags');
  const tc = document.getElementById('viz-tc');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const N = window.innerWidth >= 720 ? 64 : 42;
  const bars = [];
  for (let i = 0; i < N; i++) { const b = document.createElement('i'); barsEl.appendChild(b); bars.push(b); }

  const names = [['Whoosh', 0.12], ['UI click', 0.31], ['Impact', 0.5], ['Pop', 0.68], ['Sparkle', 0.86]];
  const tags = names.map(([label, pos]) => {
    const el = document.createElement('span'); el.className = 'lp-viz__tag';
    el.textContent = label + '.wav'; el.style.left = (pos * 100) + '%';
    tagsEl.appendChild(el); return { el, pos, hit: false };
  });

  const DUR = 7.5; // seconds per sweep
  const pad = (n) => String(n).padStart(2, '0');
  let w = 0;
  const measure = () => { w = stage.clientWidth; };
  measure(); window.addEventListener('resize', measure);

  let prev = -1;
  const draw = (t) => {
    const x = (t % DUR) / DUR; // 0..1 playhead position
    if (x < prev) tags.forEach((g) => { g.hit = false; });
    prev = x;
    ph.style.transform = 'translateX(' + (x * w) + 'px)';
    for (let i = 0; i < N; i++) {
      const p = i / (N - 1);
      const base = 0.16 + 0.16 * (Math.sin(p * 9 + t * 1.6) * 0.5 + 0.5) + 0.06 * Math.sin(i * 1.7 + t * 2.4);
      const d = Math.abs(p - x);
      const near = Math.exp(-Math.pow(d * N / 4.2, 2));
      const trail = p < x ? Math.exp(-(x - p) * 5) * 0.22 : 0;
      const jit = 0.5 + 0.5 * Math.sin(t * 11 + i * 2.3);
      const h = Math.min(1, base + trail + near * (0.5 + 0.35 * jit));
      const b = bars[i];
      b.style.transform = 'scaleY(' + h.toFixed(3) + ')';
      const cls = d < 0.02 ? 'is-hot' : ((d < 0.07 || (p < x && p > x - 0.1)) ? 'is-lit' : '');
      if (b.className !== cls) b.className = cls;
    }
    tags.forEach((g) => {
      if (!g.hit && x >= g.pos && x < g.pos + 0.1) {
        g.hit = true; g.el.classList.remove('is-hit'); void g.el.offsetWidth; g.el.classList.add('is-hit');
      }
    });
    const total = Math.floor(x * 3 * 60 * 24); // fake timecode at 24 fps
    tc.textContent = pad(Math.floor(total / 1440)) + ':' + pad(Math.floor((total % 1440) / 24)) + ':' + pad(total % 24);
  };

  if (reduce) { draw(DUR * 0.5); return; }

  let raf = 0, start = 0, visible = true;
  const loop = (ts) => { if (!start) start = ts; draw((ts - start) / 1000); raf = requestAnimationFrame(loop); };
  const run = () => { if (!raf) { start = 0; raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) run(); else stop(); }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (visible) run(); });
  run();
})();
