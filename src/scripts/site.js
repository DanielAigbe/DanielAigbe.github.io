// Small site-wide behaviours: scroll reveal, progress line, custom cursor, letter scramble.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

// Links to other websites open in a new tab, so visitors keep the portfolio open.
document.querySelectorAll('a[href^="http"]').forEach((a) => {
  if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if (reduce || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
}

// Progress line down the right edge
const bar = document.querySelector('.progress');
if (bar && !reduce) {
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// Crimson dot cursor, only for mouse users
const dot = document.querySelector('.cursor');
if (dot && !reduce && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    dot.classList.add('on');
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    dot.classList.toggle('big', !!e.target.closest('a, button, [data-cursor]'));
  });
  document.addEventListener('mouseleave', () => dot.classList.remove('on'));
  // Hide the dot over 3D scenes: the scene takes over the pointer there.
  document.querySelectorAll('[data-nocursor]').forEach((el) => el.addEventListener('mouseenter', () => dot.classList.remove('on')));
}

// Letter scramble: cycles through the words in data-scramble
document.querySelectorAll('[data-scramble]').forEach((el) => {
  const words = el.dataset.scramble.split('|');
  if (reduce || words.length < 2) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_/#';
  let i = 0;
  const next = () => {
    i = (i + 1) % words.length;
    const target = words[i];
    let step = 0;
    const tick = setInterval(() => {
      step++;
      let out = '';
      for (let k = 0; k < target.length; k++) {
        out += k < step - 6 || target[k] === ' ' ? target[k] : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (step >= target.length + 6) {
        clearInterval(tick);
        el.textContent = target;
        setTimeout(next, 2200);
      }
    }, 45);
  };
  setTimeout(next, 2200);
});

// Scrolling mockups: tap to toggle on touch screens
document.querySelectorAll('[data-scrollmock]').forEach((el) => {
  el.addEventListener('click', () => el.classList.toggle('play'));
});

// Start the e-Flames logo animation when it scrolls into view
document.querySelectorAll('[data-ef]').forEach((el) => {
  if (reduce || !('IntersectionObserver' in window)) return el.classList.add('go');
  const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add('go'); o.disconnect(); } }), { threshold: 0.35 });
  o.observe(el);
});

// Parallax: elements with data-parallax="0.2" drift at a different speed from the page.
// Bigger number = stronger effect. Off on small screens and for reduced motion.
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
if (parallaxEls.length && !reduce) {
  let items = [];
  const wide = () => window.innerWidth > 820;
  const measure = () => {
    items = parallaxEls.map((el) => {
      el.style.translate = '';
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return { el, top, h: r.height, speed: parseFloat(el.dataset.parallax) || 0.1, first: top < window.innerHeight };
    });
    draw();
  };
  let ticking = false;
  const draw = () => {
    ticking = false;
    if (!wide()) return items.forEach((i) => (i.el.style.translate = ''));
    const y = window.scrollY, vh = window.innerHeight;
    for (const i of items) {
      // Items in the first screen start from their designed position; lower items are centred on the viewport.
      const shift = i.first ? y * i.speed : -(i.top + i.h / 2 - y - vh / 2) * i.speed;
      if (i.top - y < vh * 1.5 && i.top + i.h - y > -vh * 0.5) i.el.style.translate = `0 ${shift.toFixed(1)}px`;
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
}
