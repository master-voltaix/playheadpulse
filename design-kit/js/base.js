/* Minimal base script for new pages: header turns white on scroll, reveal-on-scroll, year. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.querySelector('.site-header');
  if (header) {
    const on = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
  }

  const items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
