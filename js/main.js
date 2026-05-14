/* ════════════════════════════════════════════════════════════
   Main site interactions
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Loader ─────────────────────────────────────────── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('gone');
      // Trigger hero reveals after load
      document.querySelectorAll('.hero .reveal, .hero .hl, .hero .hero-tag, .hero .hero-sub, .hero .hero-btns')
        .forEach(el => el.classList.add('visible'));
    }, 900);
  });

  /* ── Custom Cursor ──────────────────────────────────── */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (cursorDot && cursorRing) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    });

    function followRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(followRing);
    }
    followRing();

    // Cursor grow on interactive elements
    const interactive = 'a, button, .svc-card, .book-scene, input, select, textarea, .stat, .role, .ufeat, .ustat, .tl-card, .theme-opt';
    document.querySelectorAll(interactive).forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
    });

    // Click ripple
    document.addEventListener('mousedown', () => cursorRing.classList.add('click'));
    document.addEventListener('mouseup',   () => setTimeout(() => cursorRing.classList.remove('click'), 400));

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.6';
    });
  }

  /* ── Scroll Progress Bar ────────────────────────────── */
  const progress = document.getElementById('scrollProgress');
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
  }

  /* ── Theme Switcher ─────────────────────────────────── */
  const THEMES = {
    sunset:   { primary: 0xFF4500, secondary: 0xFFB627, accent: 0xFFD700, bg: 0x060606 },
    aurora:   { primary: 0x00d4ff, secondary: 0xa78bfa, accent: 0x00ffe0, bg: 0x05071a },
    forest:   { primary: 0x00ff88, secondary: 0xffd700, accent: 0x84cc16, bg: 0x050e09 },
    royale:   { primary: 0xff00aa, secondary: 0xc084fc, accent: 0xfbbf24, bg: 0x0a0014 },
    daylight: { primary: 0xea580c, secondary: 0x6b21a8, accent: 0x1a1a1a, bg: 0xfafafa },
  };

  const themeToggle = document.getElementById('themeToggle');
  const themePanel  = document.getElementById('themePanel');
  const themeOpts   = document.querySelectorAll('.theme-opt');
  const themeName   = document.getElementById('themeName');

  function setTheme(name) {
    if (!THEMES[name]) name = 'sunset';
    document.body.classList.add('theme-transition');
    document.body.setAttribute('data-theme', name);
    localStorage.setItem('rc-theme', name);

    themeOpts.forEach(o => o.classList.toggle('active', o.dataset.theme === name));
    if (themeName) themeName.textContent = name.charAt(0).toUpperCase() + name.slice(1);

    // Update Three.js colors
    if (window.updateSceneColors) window.updateSceneColors(THEMES[name]);

    // Remove transition class after animation
    setTimeout(() => document.body.classList.remove('theme-transition'), 800);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themePanel.classList.toggle('open');
      themeToggle.classList.toggle('active');
    });
  }

  themeOpts.forEach(opt => {
    opt.addEventListener('click', () => setTheme(opt.dataset.theme));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-switcher')) {
      themePanel && themePanel.classList.remove('open');
      themeToggle && themeToggle.classList.remove('active');
    }
  });

  // Initialize theme (saved or default), so switcher UI shows active state
  setTheme(localStorage.getItem('rc-theme') || 'sunset');

  // Keyboard shortcut: T to cycle themes
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't' && !e.target.matches('input, textarea, select')) {
      const names = Object.keys(THEMES);
      const current = document.body.getAttribute('data-theme') || 'sunset';
      const next = names[(names.indexOf(current) + 1) % names.length];
      setTheme(next);
    }
  });

  /* ── Nav scroll style ───────────────────────────────── */
  const nav = document.getElementById('nav');
  const tabs = document.querySelectorAll('.tab, .mob-link');

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Active tab from URL (multi-page) */
  (function setActiveTab() {
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isHome = path === '' || path === 'index.html';
    tabs.forEach(tab => {
      const href = (tab.getAttribute('href') || '').toLowerCase();
      const active = (isHome && href === 'index.html') || href === path;
      tab.classList.toggle('active', active);
    });
  }());

  /* ── Hamburger / Mobile menu ────────────────────────── */
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobMenu');
  if (ham && mob) {
    ham.addEventListener('click', (e) => {
      e.stopPropagation();
      ham.classList.toggle('open');
      mob.classList.toggle('open');
    });
    document.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        ham.classList.remove('open');
        mob.classList.remove('open');
      });
    });
    document.addEventListener('click', (e) => {
      if (!ham.contains(e.target) && !mob.contains(e.target)) {
        ham.classList.remove('open');
        mob.classList.remove('open');
      }
    });
  }

  /* ── Smooth scroll links ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH + 2;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Intersection Observer: reveals ─────────────────── */
  const animEls = document.querySelectorAll('.anim-in');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  animEls.forEach(el => revealObs.observe(el));

  /* ── Animated counters ──────────────────────────────── */
  const counters = document.querySelectorAll('.snum');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.t, 10);
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.floor(ease * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObs.observe(c));

  /* ── Typewriter effect ──────────────────────────────── */
  const tw = document.getElementById('typewriter');
  const phrases = [
    '"Help people achieve their Impossible"',
    '"Making I Am Possible"',
    '"Pain is Inevitable, Suffering is Optional"',
    '"Get Off Your Ass — GOYA"',
    '"Keep Miling & Smiling"',
  ];
  let pi = 0, ci = 0, deleting = false, paused = false;

  function typeLoop() {
    if (!tw) return;
    const phrase = phrases[pi];
    if (paused) { setTimeout(typeLoop, 1800); paused = false; return; }
    if (!deleting) {
      tw.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; paused = true; }
      setTimeout(typeLoop, 55);
    } else {
      tw.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      setTimeout(typeLoop, 25);
    }
  }
  setTimeout(typeLoop, 1500);

  /* ── La Ultra floating particles ────────────────────── */
  (function buildUltraParticles() {
    const container = document.getElementById('ultraParticles');
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const p = document.createElement('div');
      const size = 2 + Math.random() * 5;
      const dur = 8 + Math.random() * 12;
      const delay = -Math.random() * 12;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      p.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        background: var(--secondary);
        border-radius: 50%;
        left: ${left}%; top: ${top}%;
        opacity: ${0.15 + Math.random() * 0.4};
        box-shadow: 0 0 ${size * 2}px var(--primary);
        animation: floatDot ${dur}s ease-in-out infinite;
        animation-delay: ${delay}s;
      `;
      container.appendChild(p);
    }
  }());

  // Inject float keyframe (uses CSS variables for theme awareness)
  const ks = document.createElement('style');
  ks.textContent = `
    @keyframes floatDot {
      0%   { transform: translate(0, 0) scale(1);   opacity: 0.3; }
      33%  { transform: translate(20px, -40px) scale(1.3); opacity: 0.8; }
      66%  { transform: translate(-15px, 30px) scale(0.8); opacity: 0.2; }
      100% { transform: translate(0, 0) scale(1);   opacity: 0.3; }
    }
  `;
  document.head.appendChild(ks);

  /* ── Service card 3D magnetic tilt ──────────────────── */
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = -(y - cy) / cy * 6;
      const rotY = (x - cx) / cx * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Magnetic buttons ───────────────────────────────── */
  document.querySelectorAll('.btn-primary, .btn-ghost, .soc-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ── Text scramble on service title hover ───────────── */
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#§$%&';
  function scramble(el, finalText, duration = 600) {
    if (el._scrambling) return;
    el._scrambling = true;
    const length = finalText.length;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealed = Math.floor(progress * length);
      let result = '';
      for (let i = 0; i < length; i++) {
        if (i < revealed || finalText[i] === ' ') result += finalText[i];
        else result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      el.textContent = result;
      if (progress < 1) requestAnimationFrame(step);
      else { el.textContent = finalText; el._scrambling = false; }
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('.svc-card h3, .tl-card h3').forEach(h => {
    const original = h.textContent;
    h.addEventListener('mouseenter', () => scramble(h, original, 500));
  });

  /* ── Parallax on scroll (hero text) ─────────────────── */
  const heroBody = document.querySelector('.hero-body');
  window.addEventListener('scroll', () => {
    if (heroBody && window.scrollY < window.innerHeight) {
      const y = window.scrollY * 0.4;
      const op = 1 - (window.scrollY / window.innerHeight) * 1.2;
      heroBody.style.transform = `translateY(${y}px)`;
      heroBody.style.opacity = Math.max(0, op);
    }
  }, { passive: true });

  /* ── Contact form ────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;
        if (success) success.classList.add('show');
        setTimeout(() => success && success.classList.remove('show'), 5000);
      }, 1200);
    });
  }

  /* ── Book card keyboard flip ─────────────────────────── */
  document.querySelectorAll('.book-scene').forEach(scene => {
    scene.setAttribute('tabindex', '0');
    scene.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const book = scene.querySelector('.book-3d');
        book.style.transform = book.style.transform ? '' : 'rotateY(180deg)';
      }
    });
  });

  /* ── Nav logo → top ─────────────────────────────────── */
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial calls
  onScroll();
}());
