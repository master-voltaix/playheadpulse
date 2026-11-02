/* ==========================================================================
   Playhead Pulse — theme.js (v2, no dependencies, loaded with defer)
   Header · panels · cart · waveforms · synth previews · player · hero
   timeline · pads · scroll highlight · meters/count-up · gallery ·
   product bar scroll-spy · reveal · newsletter
   ========================================================================== */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  if (!('IntersectionObserver' in window)) root.classList.add('no-io');

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Catalog — static stand-in for Shopify product objects.
     In Liquid, render from {{ product }} / {{ variant.compare_at_price }}
     and swap the Cart adapter for the Ajax Cart API (/cart/add.js).
     ------------------------------------------------------------------ */
  const CATALOG = {
    'core-pack': {
      id: 'core-pack',
      title: 'Core Pack: 800+ Social Media SFX',
      meta: '853 SFX · WAV · Digital',
      price: 1990,      // cents (19,90 €)
      compareAt: 5490,  // cents (54,90 €)
      image: 'assets/img/core-pack-cover-clean.webp',
      url: 'product.html'
    }
  };
  const fmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const money = (cents) => fmt.format(cents / 100);

  /* ---------------- Header: solid after scrolling ---------------- */
  const siteHeader = $('.site-header');
  if (siteHeader) {
    const onHeadScroll = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    onHeadScroll();
    window.addEventListener('scroll', onHeadScroll, { passive: true });
  }

  /* ---------------- Panels (menu, cart) ---------------- */
  const overlay = $('.overlay');
  let openPanel = null;
  let lastFocus = null;
  function open(panel) {
    if (!panel) return;
    close();
    lastFocus = document.activeElement;
    openPanel = panel;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (panel.classList.contains('drawer')) overlay?.classList.add('is-open');
    document.body.classList.add('no-scroll');
    $$('[aria-controls="' + panel.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    setTimeout(() => panel.querySelector('button, a, input')?.focus(), 60);
  }
  function close() {
    if (!openPanel) return;
    openPanel.classList.remove('is-open');
    openPanel.setAttribute('aria-hidden', 'true');
    $$('[aria-controls="' + openPanel.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    overlay?.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    openPanel = null;
    lastFocus?.focus?.();
  }
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => open(document.getElementById(b.dataset.open))));
  $$('[data-close]').forEach((b) => b.addEventListener('click', close));
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $$('.mobile-nav a').forEach((a) => a.addEventListener('click', close));

  /* ---------------- Toast ---------------- */
  const toast = $('.toast');
  let toastTimer;
  function showToast(text) {
    if (!toast) return;
    $('.toast__text', toast).textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  /* ---------------- Cart (localStorage adapter) ---------------- */
  const Cart = {
    key: 'php-cart-v1',
    read() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
    write(items) { try { localStorage.setItem(this.key, JSON.stringify(items)); } catch { /* blocked */ } this._mem = items; },
    items() { return (this._mem ||= this.read()).filter((i) => CATALOG[i.id]); },
    add(id) {
      const items = this.items().slice();
      if (!items.find((i) => i.id === id) && CATALOG[id]) items.push({ id, qty: 1 }); // one license per pack
      this.write(items);
    },
    remove(id) { this.write(this.items().filter((i) => i.id !== id)); },
    sum(field) { return this.items().reduce((s, i) => s + (CATALOG[i.id][field] || CATALOG[i.id].price) * i.qty, 0); },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); }
  };

  const drawer = $('#cart-drawer');
  function renderCart() {
    const count = Cart.count();
    $$('.cart-count').forEach((el) => { el.textContent = count; el.classList.toggle('has-items', count > 0); });
    $$('[data-cart-label]').forEach((el) => el.setAttribute('aria-label', 'Cart, ' + count + (count === 1 ? ' item' : ' items')));
    if (!drawer) return;
    $('.drawer__head h2 span', drawer).textContent = '(' + count + ')';
    const body = $('.drawer__body', drawer);
    const foot = $('.drawer__foot', drawer);
    if (!count) {
      body.innerHTML =
        '<div class="cart-empty"><strong>Your cart is quiet.</strong><p>Pick a pack and start cutting.</p>' +
        '<a class="btn btn--dark btn--sm" href="collection.html">Shop sound packs</a></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = Cart.items().map((i) => {
      const p = CATALOG[i.id];
      return '<div class="line-item">' +
        '<a class="line-item__img" href="' + p.url + '"><img src="' + p.image + '" alt="" width="84" height="84" loading="lazy"></a>' +
        '<div><a class="line-item__title" href="' + p.url + '">' + p.title + '</a><div class="line-item__meta">' + p.meta + '</div></div>' +
        '<div class="line-item__right"><span class="price">' + money(p.price * i.qty) + '</span>' +
        (p.compareAt ? '<s class="price--was">' + money(p.compareAt * i.qty) + '</s>' : '') +
        '<button class="remove" type="button" data-remove="' + i.id + '">Remove</button></div></div>';
    }).join('');
    const total = Cart.sum('price');
    const was = Cart.sum('compareAt');
    $('.drawer__total .price', drawer).textContent = money(total);
    const save = $('.drawer__save', drawer);
    if (save) { save.hidden = was <= total; $('span:last-child', save).textContent = money(was - total); }
  }
  drawer?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (btn) { Cart.remove(btn.dataset.remove); renderCart(); }
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    Cart.add(btn.dataset.add);
    renderCart();
    btn.classList.add('is-added');
    setTimeout(() => btn.classList.remove('is-added'), 1200);
    if (btn.hasAttribute('data-checkout')) { showToast('Checkout connects in Shopify'); return; } // Shopify: location = '/checkout'
    open(drawer);
  });
  $('[data-checkout-btn]')?.addEventListener('click', () => showToast('Checkout connects in Shopify'));
  window.addEventListener('storage', (e) => { if (e.key === Cart.key) { Cart._mem = null; renderCart(); } });

  /* ---------------- Waveforms ---------------- */
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const SHAPES = {
    bell: (x) => Math.sin(Math.PI * x) ** 1.4,
    hit: (x) => Math.exp(-x * 4.5),
    spike: (x) => (x < 0.12 ? 1 : Math.exp(-(x - 0.12) * 12) * 0.5),
    rise: (x) => (x < 0.92 ? Math.pow(x / 0.92, 1.6) : 0.15),
    ring: (x) => Math.exp(-x * 2.6),
    glitch: () => 0.75,
    double: (x) => Math.max(Math.exp(-Math.abs(x - 0.15) * 18), Math.exp(-Math.abs(x - 0.55) * 18)),
    taps: (x) => (Math.sin(x * Math.PI * 11) > 0.55 ? 0.9 : 0.12),
    steps: (x) => [0.9, 0.55, 0.75, 1][Math.floor(x * 3.99)],
    flat: () => 0.6,
    music: (x) => 0.45 + 0.4 * Math.abs(Math.sin(x * Math.PI * 7)),
    mix: (x) => 0.35 + 0.65 * Math.abs(Math.sin(x * Math.PI * 3.2)) * (0.6 + 0.4 * Math.sin(x * 17))
  };
  function buildWaves(scope = document) {
    $$('[data-wave]', scope).forEach((el) => {
      if (el.dataset.built) return;
      const n = +el.dataset.bars || 48;
      const shape = SHAPES[el.dataset.shape] || SHAPES.bell;
      const r = rng(hash(el.dataset.wave));
      let html = '';
      for (let i = 0; i < n; i++) {
        const x = n > 1 ? i / (n - 1) : 0;
        const h = Math.max(0.08, Math.min(1, shape(x) * (0.55 + r() * 0.45) + r() * 0.08));
        html += '<i style="--h:' + Math.round(h * 100) + '%;--d:' + (r() * 1.6).toFixed(2) + '"></i>';
      }
      el.innerHTML = html;
      el.dataset.built = '1';
      el.setAttribute('aria-hidden', 'true');
    });
  }
  buildWaves();

  /* ---------------- Synth ----------------
     Short Web Audio sketches so previews work before real MP3s exist.
     Any [data-sound] with data-src plays that file instead. */
  const Synth = (() => {
    let ctx, master, analyser;
    function ac() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.55;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp); comp.connect(ctx.destination);
        analyser = ctx.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.78;
        comp.connect(analyser);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function noise(d) {
      const len = Math.ceil(ctx.sampleRate * d);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(); s.buffer = buf; return s;
    }
    function env(t, a, peak, d) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
      return g;
    }
    const filt = (type, f, q = 0.8) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; };
    function burst(t, out, d, type, f, peak = 0.8) { const n = noise(d); n.connect(filt(type, f)).connect(env(t, 0.002, peak, d)).connect(out); n.start(t); n.stop(t + d + 0.02); }
    function tone(t, out, f, d, peak = 0.4, type = 'sine', fEnd) {
      const o = osc(type, f);
      if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + d);
      o.connect(env(t, 0.004, peak, d)).connect(out); o.start(t); o.stop(t + d + 0.03);
    }
    function sweep(t, out, d, f0, f1, f2, q, peak) {
      const n = noise(d); const f = filt('bandpass', f0, q);
      f.frequency.setValueAtTime(f0, t);
      f.frequency.exponentialRampToValueAtTime(f1, t + d * 0.48);
      f.frequency.exponentialRampToValueAtTime(f2, t + d);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + d * 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      n.connect(f).connect(g).connect(out); n.start(t); n.stop(t + d);
      return d;
    }
    function rise(t, out, d, f0, f1, type, peak) {
      const o = osc(type, f0); const f = filt('lowpass', 500, 4);
      o.frequency.exponentialRampToValueAtTime(f1, t + d);
      f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5200, t + d);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + d - 0.02);
      g.gain.linearRampToValueAtTime(0.0001, t + d + 0.03);
      o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + d + 0.05);
      return d + 0.05;
    }
    function glitch(t, out, d, step, lo, hi) {
      const o = osc('square', 300); const g = ctx.createGain(); g.gain.value = 0;
      let f = lo + Math.random() * (hi - lo);
      for (let s = 0; s < d; s += step) {
        if (Math.random() > 0.55) f = lo + Math.random() * (hi - lo);
        o.frequency.setValueAtTime(f, t + s);
        g.gain.setValueAtTime(Math.random() > 0.3 ? 0.14 : 0, t + s);
      }
      g.gain.setValueAtTime(0, t + d);
      o.connect(filt('lowpass', 3500)).connect(g).connect(out); o.start(t); o.stop(t + d + 0.02);
      return d;
    }
    const S = {
      whoosh: (t, o) => sweep(t, o, 0.75, 350, 3400, 450, 1.1, 1.2),
      whooshSoft: (t, o) => sweep(t, o, 1.0, 260, 1700, 300, 0.6, 0.8),
      click: (t, o) => { burst(t, o, 0.018, 'highpass', 3200, 0.9); tone(t, o, 2100, 0.03, 0.25); return 0.12; },
      toggle: (t, o) => { burst(t, o, 0.012, 'highpass', 2800, 0.6); tone(t + 0.05, o, 1250, 0.05, 0.25); return 0.16; },
      pop: (t, o) => { tone(t, o, 1100, 0.11, 0.7, 'sine', 170); burst(t, o, 0.01, 'bandpass', 1800, 0.3); return 0.18; },
      bubble: (t, o) => { tone(t, o, 520, 0.09, 0.6, 'sine', 1500); return 0.15; },
      impact: (t, o) => { tone(t, o, 120, 1.1, 1.0, 'sine', 34); burst(t, o, 0.3, 'lowpass', 900, 0.9); return 1.2; },
      hit: (t, o) => { tone(t, o, 95, 0.7, 0.9, 'sine', 42); burst(t, o, 0.16, 'lowpass', 2600, 1); tone(t, o, 210, 0.25, 0.25, 'triangle', 120); return 0.8; },
      riser: (t, o) => rise(t, o, 1.6, 160, 1300, 'sawtooth', 0.28),
      swell: (t, o) => rise(t, o, 0.9, 220, 900, 'triangle', 0.45),
      ding: (t, o) => { tone(t, o, 1318.5, 1.2, 0.45); tone(t, o, 2637, 0.8, 0.14); tone(t, o, 3951, 0.4, 0.05); return 1.25; },
      levelup: (t, o) => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(t + i * 0.075, o, f, i === 3 ? 0.45 : 0.1, 0.22, 'triangle')); return 0.7; },
      glitch: (t, o) => glitch(t, o, 0.48, 0.032, 80, 1480),
      stutter: (t, o) => glitch(t, o, 0.42, 0.05, 160, 700),
      shutter: (t, o) => { burst(t, o, 0.035, 'bandpass', 2600, 1); burst(t + 0.075, o, 0.05, 'bandpass', 1900, 0.8); return 0.2; },
      typing: (t, o) => { let s = 0; for (let i = 0; i < 7; i++) { burst(t + s, o, 0.02, 'bandpass', 2400 + Math.random() * 1600, 0.7); s += 0.07 + Math.random() * 0.06; } return s + 0.05; },
      notify: (t, o) => { tone(t, o, 880, 0.18, 0.35); tone(t + 0.12, o, 1318.5, 0.4, 0.35); return 0.55; },
      ping: (t, o) => { tone(t, o, 1760, 0.5, 0.3); tone(t, o, 2640, 0.2, 0.08); return 0.55; }
    };
    return {
      async load(url) {
        if (!ac()) return null;
        this._cache = this._cache || {};
        if (!this._cache[url]) {
          this._cache[url] = fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
            .then((buf) => new Promise((res, rej) => ctx.decodeAudioData(buf, res, rej)))
            .catch(() => null);
        }
        return this._cache[url];
      },
      playBuffer(buffer) {
        if (!ac() || !buffer) return null;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(master);
        src.start();
        return src;
      },
      levels(arr) {
        if (!analyser || !ctx || ctx.state !== 'running') return 0;
        analyser.getByteFrequencyData(arr);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) sum += arr[i];
        const avg = sum / arr.length / 255;
        return avg > 0.012 ? avg : 0;
      },
      play(type) {
        if (!ac() || !S[type]) return null;
        const out = ctx.createGain(); out.connect(master);
        const d = S[type](ctx.currentTime + 0.01, out);
        const t0 = performance.now();
        return {
          progress: () => Math.min(1, (performance.now() - t0) / 1000 / d),
          stop: () => { out.gain.setValueAtTime(0, ctx.currentTime); setTimeout(() => out.disconnect(), 60); }
        };
      }
    };
  })();

  /* ---------------- Player ([data-sound]) ---------------- */
  const Player = (() => {
    let cur = null;
    const setBars = (bars, p) => { const k = Math.round(p * bars.length); bars.forEach((b, i) => b.classList.toggle('on', i < k)); };
    function stop() {
      if (!cur) return;
      cancelAnimationFrame(cur.raf);
      cur.handle?.stop();
      cur.host.classList.remove('is-playing');
      cur.btn.setAttribute('aria-pressed', 'false');
      setBars(cur.bars, 0);
      cur = null;
    }
    function start(btn) {
      const host = btn.closest('.sound') || btn;
      const bars = $$('.wave i', host);
      let handle;
      if (btn.dataset.src) {
        const audio = new Audio(btn.dataset.src);
        audio.play().catch(stop);
        handle = { progress: () => (audio.duration ? audio.currentTime / audio.duration : 0), stop: () => audio.pause(), file: true };
        audio.addEventListener('ended', () => { if (cur?.btn === btn) stop(); });
      } else {
        handle = Synth.play(btn.dataset.synth || 'click');
        if (!handle) return;
      }
      cur = { btn, host, bars, handle, raf: 0 };
      host.classList.add('is-playing');
      btn.setAttribute('aria-pressed', 'true');
      const tick = () => {
        if (cur?.btn !== btn) return;
        const p = handle.progress();
        setBars(bars, p);
        if (p >= 1 && !handle.file) { setTimeout(() => cur?.btn === btn && stop(), 120); return; }
        cur.raf = requestAnimationFrame(tick);
      };
      tick();
    }
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-sound]');
      if (!btn) return;
      const same = cur?.btn === btn;
      stop();
      if (!same) start(btn);
    });
    return { stop };
  })();

  /* ---------------- Hero spectrum (idle motion + reacts to real audio) ---------------- */
  $$('[data-spectrum]').forEach((hero) => {
    const layers = $$('.hs__bars', hero);
    if (!layers.length) return;
    const isSmall = window.matchMedia('(max-width: 719px)').matches;
    const n = isSmall ? 16 : (+hero.dataset.bars || 34);
    layers.forEach((l) => { l.innerHTML = '<i></i>'.repeat(n); });
    const bars = layers.map((l) => $$('i', l));
    const seeds = Array.from({ length: n }, (_, i) => ({
      a: 0.6 + ((i * 7919) % 97) / 97 * 0.9,     // speed 1
      b: 1.3 + ((i * 104729) % 89) / 89 * 1.4,   // speed 2
      p: ((i * 31337) % 360) * Math.PI / 180      // phase
    }));
    const freq = new Uint8Array(64);
    let visible = true;
    let raf = 0;
    let energy = 0;

    const frame = (now) => {
      const t = now / 1000;
      const level = Synth.levels(freq);           // 0..1 overall loudness, fills freq
      energy += ((level ? 1 : 0) - energy) * 0.06;
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1);
        const edge = 0.5 + 0.5 * Math.pow(Math.abs(x - 0.5) * 2, 1.2);   // taller toward the sides, calmer behind the copy
        const s = seeds[i];
        let h = 0.22 + edge * (0.42 + 0.16 * Math.sin(t * s.a + s.p) + 0.1 * Math.sin(t * s.b * 1.7 + s.p * 2));
        if (level) {
          const bin = freq[Math.min(freq.length - 1, Math.floor(Math.abs(x - 0.5) * 2 * 40))] / 255;
          h += bin * (0.45 + edge * 0.35) * energy;
        }
        h = Math.max(0.08, Math.min(1, h));
        const v = 'scaleY(' + h.toFixed(3) + ')';
        bars[0][i].style.transform = v;
        if (bars[1]) bars[1][i].style.transform = v;
      }
      raf = (visible && !reduceMotion) || level ? requestAnimationFrame(frame) : 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(hero);
    reduceMotion ? frame(0) : start();

    // Orb + "hear it" buttons: play the hero reel (real sound files if provided, synth otherwise)
    let reel = [];
    try { reel = JSON.parse(hero.dataset.reel || '[]').filter((r) => r && r.src); } catch { reel = []; }
    const FALLBACK = [['whoosh', 0], ['pop', 650], ['glitch', 1000], ['riser', 1600], ['impact', 3250], ['ding', 4500]];
    let timers = [];
    let sources = [];
    let loading = null;
    const orb = $('[data-hs-orb]', hero);
    const preload = () => { if (!loading && reel.length) loading = Promise.all(reel.map((r) => Synth.load(r.src))); return loading; };
    if (reel.length && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en], io) => { if (en.isIntersecting) { preload(); io.disconnect(); } }).observe(hero);
    }
    const stopReel = () => {
      timers.forEach(clearTimeout); timers = [];
      sources.forEach((s) => { try { s.stop(); } catch { /* already ended */ } }); sources = [];
      orb?.classList.remove('is-playing');
    };
    const playReel = async () => {
      if (timers.length || orb?.classList.contains('is-playing')) { stopReel(); return; }
      Player.stop();
      orb?.classList.add('is-playing');
      let buffers = null;
      if (reel.length) {
        buffers = await preload();
        if (!orb?.classList.contains('is-playing')) return;
        if (!buffers || buffers.some((b) => !b)) buffers = null;
      }
      if (buffers) {
        let end = 0;
        reel.forEach((r, i) => {
          end = Math.max(end, r.at + buffers[i].duration * 1000);
          timers.push(setTimeout(() => { const s = Synth.playBuffer(buffers[i]); if (s) sources.push(s); start(); }, r.at));
        });
        timers.push(setTimeout(stopReel, end + 300));
      } else {
        FALLBACK.forEach(([s, at]) => timers.push(setTimeout(() => { Synth.play(s); start(); }, at)));
        timers.push(setTimeout(stopReel, 5900));
      }
    };
    $$('[data-hs-play]').forEach((b) => b.addEventListener('click', playReel));
  });

  /* ---------------- Hero timeline ---------------- */
  $$('[data-timeline]').forEach((tl) => {
    const D = +tl.dataset.duration || 8;
    const head = $('.tl__playhead', tl);
    const tc = $('.tl__tc', tl);
    const clips = $$('.clip--sfx', tl).map((el) => ({ el, at: +el.dataset.at, end: +el.dataset.at + +el.dataset.len, synth: el.dataset.synth }));
    const buttons = $$('[data-timeline-play]');
    let mode = 'idle';
    let t0 = performance.now();
    let fired = new Set();
    let visible = true;
    let raf = 0;

    const tcode = (s) => '00:00:' + String(Math.floor(s)).padStart(2, '0') + ':' + String(Math.floor((s % 1) * 30)).padStart(2, '0');
    function setMode(m) {
      mode = m;
      fired = new Set();
      t0 = performance.now();
      buttons.forEach((b) => {
        b.classList.toggle('is-on', m === 'play');
        const label = $('.tl__label', b);
        if (label) label.textContent = m === 'play' ? 'Stop' : (b.dataset.label || 'Play the edit');
      });
      if (m === 'play') { Player.stop(); loop(); }
    }
    function render(now) {
      let t = (now - t0) / 1000;
      if (mode === 'play' && t >= D) { setMode('idle'); t = 0; }
      if (mode === 'idle' && reduceMotion) t = 0;
      t %= D;
      const p = t / D;
      head.style.left = (p * 100).toFixed(3) + '%';
      tc.textContent = tcode(t);
      clips.forEach((c) => {
        c.el.classList.toggle('is-hit', p >= c.at && p <= c.end);
        if (mode === 'play' && p >= c.at && !fired.has(c)) { fired.add(c); Synth.play(c.synth); }
      });
    }
    function loop() {
      cancelAnimationFrame(raf);
      const step = (now) => {
        render(now);
        if ((visible || mode === 'play') && !(reduceMotion && mode === 'idle')) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    buttons.forEach((b) => b.addEventListener('click', () => {
      setMode(mode === 'play' ? 'idle' : 'play');
      if (b.closest('.hero__actions')) tl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(tl);
    }
    loop();
  });

  /* ---------------- Pads: number keys 1–8 ---------------- */
  const pads = $$('.pad');
  if (pads.length) {
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= pads.length) { e.preventDefault(); pads[n - 1].click(); }
    });
  }

  /* ---------------- Scroll highlight (statement) ---------------- */
  const highlights = $$('[data-highlight]');
  if (highlights.length) {
    const words = highlights.map((el) => $$('.w', el));
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      highlights.forEach((el, k) => {
        const r = el.getBoundingClientRect();
        const p = reduceMotion ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
        const n = Math.round(p * words[k].length);
        words[k].forEach((w, i) => w.classList.toggle('on', i < n));
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------------- Count-up ---------------- */
  function countUp(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const target = +el.dataset.count;
      const pad = el.dataset.pad ? +el.dataset.pad : 0;
      if (reduceMotion) { el.textContent = String(target).padStart(pad, '0'); return; }
      const t0 = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = String(Math.round(target * e)).padStart(pad, '0');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------------- Reveal / in-view ---------------- */
  const watch = $$('.reveal, .meters, .heard, [data-countscope]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    watch.forEach((el) => io.observe(el));
  } else {
    watch.forEach((el) => { el.classList.add('is-in'); countUp(el); });
  }

  /* ---------------- Product gallery (mobile swipe indicator) ---------------- */
  $$('.pgallery').forEach((g) => {
    const track = $('.pgallery__track', g);
    const dots = $$('.pgallery__count i', g);
    if (!track || !dots.length) return;
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
    }, { passive: true });
  });

  /* ---------------- Product bar scroll-spy ---------------- */
  const spyLinks = $$('.pbar__nav a[href^="#"]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(spyLinks.map((a) => [document.getElementById(a.hash.slice(1)), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        spyLinks.forEach((a) => a.classList.remove('is-active'));
        map.get(en.target)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, sec) => sec && spy.observe(sec));
  }

  /* ---------------- Collection sort ---------------- */
  const sort = $('#sort-by');
  const grid = $('[data-product-grid]');
  if (sort && grid) {
    sort.addEventListener('change', () => {
      const cards = $$('[data-price]', grid);
      const by = sort.value;
      cards.sort((a, b) => {
        if (by === 'price-asc') return a.dataset.price - b.dataset.price;
        if (by === 'price-desc') return b.dataset.price - a.dataset.price;
        if (by === 'title') return a.dataset.title.localeCompare(b.dataset.title);
        return a.dataset.index - b.dataset.index;
      });
      const tail = $('.card--soon', grid);
      cards.forEach((c) => grid.insertBefore(c, tail));
    });
  }

  /* ---------------- Product video (big play button, plays with sound) ---------------- */
  $$('[data-vplayer]').forEach((wrap) => {
    const video = $('video', wrap);
    const big = $('[data-vbig]', wrap);
    const soundBtn = $('[data-vsound]', wrap);
    const toggle = $('[data-vtoggle]', wrap);
    const bar = $('.vplayer__bar span', wrap);
    if (!video) return;
    video.muted = false;
    video.loop = true;
    video.playsInline = true;
    video.removeAttribute('controls');
    let wasPlaying = false;
    const label = $('span', soundBtn);

    const sync = () => {
      wrap.classList.toggle('is-paused', video.paused);
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      label.textContent = video.muted ? 'Sound on' : 'Mute';
    };
    const start = () => {
      Player.stop();
      video.muted = false;
      wrap.classList.add('is-started');
      return video.play().catch(() => { video.muted = true; return video.play().catch(() => {}); }).finally(sync);
    };

    big?.addEventListener('click', (e) => { e.stopPropagation(); start(); });
    soundBtn.addEventListener('click', (e) => { e.stopPropagation(); video.muted = !video.muted; sync(); });
    toggle.addEventListener('click', (e) => { e.stopPropagation(); if (video.paused) video.play().catch(() => {}); else video.pause(); });
    wrap.addEventListener('click', () => { if (!wrap.classList.contains('is-started')) start(); else toggle.click(); });
    $$('[data-vplay-sound]').forEach((b) => b.addEventListener('click', () => {
      wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      video.currentTime = 0;
      start();
    }));
    ['play', 'pause', 'volumechange'].forEach((ev) => video.addEventListener(ev, sync));
    video.addEventListener('timeupdate', () => { if (video.duration) bar.style.transform = 'scaleX(' + (video.currentTime / video.duration) + ')'; });

    // Pause when it scrolls out of view; resume if it was playing
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (!en.isIntersecting && !video.paused) { wasPlaying = true; video.pause(); }
        else if (en.isIntersecting && wasPlaying) { wasPlaying = false; video.play().catch(() => {}); }
      }, { threshold: 0.3 }).observe(wrap);
    }
    // Pause when the gallery is swiped to another slide
    sync();
  });

  /* ---------------- Newsletter (static stub) ---------------- */
  $$('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Shopify: {% form 'customer' %}
      const note = form.parentElement.querySelector('.form-note');
      if (note) note.textContent = "You're on the list. New packs land in your inbox first.";
      form.reset();
    });
  });

  /* ---------------- Bento: category spectrum cycles through categories ---------------- */
  $$('[data-bx-spectrum]').forEach((box) => {
    const bars = $$('.bx-s__bars i', box);
    const tip = $('.bx-s__tip', box);
    if (!bars.length || !tip) return;
    let k = 0, timer = 0;
    const show = (i) => {
      bars.forEach((b, n) => b.classList.toggle('is-active', n === i));
      const b = bars[i];
      $('b', tip).textContent = b.dataset.name;
      $('span', tip).textContent = b.dataset.n + ' sounds';
      const center = b.offsetLeft + b.offsetWidth / 2;
      const w = tip.offsetWidth;
      const left = Math.max(0, Math.min(box.clientWidth - w, center - w / 2));
      tip.style.left = left + 'px';
      tip.style.setProperty('--ax', (center - left) + 'px');
    };
    const tick = () => { show(k); k = (k + 1) % bars.length; };
    const start = () => { if (!timer && !reduceMotion) { tick(); timer = setInterval(tick, 1500); } };
    const stop = () => { clearInterval(timer); timer = 0; };
    show(0);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(box);
    else start();
    bars.forEach((b, i) => b.addEventListener('mouseenter', () => { stop(); show(i); }));
    box.addEventListener('mouseleave', () => { if (!reduceMotion) { k = 0; start(); } });
  });

  /* ---------------- 3D tilt on the featured product tile ---------------- */
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    $$('[data-tilt]').forEach((tile) => {
      const box = $('img', tile);
      if (!box) return;
      tile.addEventListener('mousemove', (e) => {
        const r = tile.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tile.classList.add('is-tilting');
        tile.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
        tile.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
        tile.style.setProperty('--sc', '1.03');
      });
      tile.addEventListener('mouseleave', () => {
        tile.classList.remove('is-tilting');
        ['--ry', '--rx'].forEach((v) => tile.style.setProperty(v, '0deg'));
        tile.style.setProperty('--sc', '1');
      });
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  renderCart();
})();
