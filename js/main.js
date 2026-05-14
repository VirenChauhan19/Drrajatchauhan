/* Main site interactions */
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

  /* ── Nav scroll style ───────────────────────────────── */
  const nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    updateActiveTab();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active tab tracking ────────────────────────────── */
  const sections = document.querySelectorAll('.sec');
  const tabs = document.querySelectorAll('.tab');
  const indicator = document.getElementById('tabIndicator');

  function updateActiveTab() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.45) current = sec.id;
    });
    tabs.forEach(tab => {
      const active = tab.dataset.s === current;
      tab.classList.toggle('active', active);
      if (active) positionIndicator(tab);
    });
  }

  function positionIndicator(tab) {
    if (!indicator) return;
    const rect = tab.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    indicator.style.left  = (rect.left - navRect.left) + 'px';
    indicator.style.width = rect.width + 'px';
  }

  /* ── Hamburger / Mobile menu ────────────────────────── */
  const ham  = document.getElementById('hamburger');
  const mob  = document.getElementById('mobMenu');
  ham.addEventListener('click', () => {
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

  /* ── Smooth scroll for tab links ────────────────────── */
  document.querySelectorAll('.tab, .mob-link, .hero-btns a, .btn').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navH = nav.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    }
  });

  /* ── Intersection Observer: section reveal ──────────── */
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
        const ease = 1 - Math.pow(1 - p, 3);
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
      setTimeout(typeLoop, 60);
    } else {
      tw.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      setTimeout(typeLoop, 30);
    }
  }
  setTimeout(typeLoop, 1400);

  /* ── La Ultra floating particles (CSS canvas) ────────── */
  function buildUltraParticles() {
    const container = document.getElementById('ultraParticles');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: rgba(255,182,39,${0.1 + Math.random() * 0.3});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: floatDot ${6 + Math.random() * 10}s ease-in-out infinite;
        animation-delay: ${-Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  }
  buildUltraParticles();

  // Inject the float keyframe
  const ks = document.createElement('style');
  ks.textContent = `
    @keyframes floatDot {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
      33%  { transform: translate(${Math.random()*40-20}px, -30px) scale(1.3); opacity: 0.8; }
      66%  { transform: translate(${Math.random()*40-20}px, 20px) scale(0.8); opacity: 0.2; }
    }
  `;
  document.head.appendChild(ks);

  /* ── Service card magnetic hover ────────────────────── */
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      card.style.transform = `translateY(-6px) rotateX(${-y * 0.04}deg) rotateY(${x * 0.04}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Contact form ────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.innerHTML = 'Send Message <span class="btn-arr">&#8594;</span>';
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

  /* ── Nav logo click → top ───────────────────────────── */
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial call
  onScroll();
}());
