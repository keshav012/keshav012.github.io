/* ============================================
   KESHAV AGRAWAL — PORTFOLIO INTERACTIONS
   ============================================ */

(() => {
  'use strict';

  /* ---------- LOADER ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => loader && loader.classList.add('gone'), 700);
  });

  /* ---------- CUSTOM CURSOR (SHARP CROSSHAIR) ---------- */
  const cross = document.querySelector('.cursor-cross');
  const isTouch = matchMedia('(hover: none)').matches;

  if (cross && !isTouch) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cross.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    document.addEventListener('mousedown', () => cross.classList.add('click'));
    document.addEventListener('mouseup', () => cross.classList.remove('click'));

    const hoverable = 'a, button, .exp-card, .cert, .project, .tl-card, .stat, .float-badge';
    document.querySelectorAll(hoverable).forEach((el) => {
      el.addEventListener('mouseenter', () => cross.classList.add('hover'));
      el.addEventListener('mouseleave', () => cross.classList.remove('hover'));
    });

    // Hide custom cursor while Cal.com modal is open (it owns its own pointer UX)
    if (window.Cal && typeof window.Cal === 'function') {
      try {
        window.Cal('on', {
          action: 'linkReady',
          callback: () => cross.classList.add('hidden'),
        });
        window.Cal('on', {
          action: 'linkFailed',
          callback: () => cross.classList.remove('hidden'),
        });
        window.Cal('on', {
          action: '__closeIframe',
          callback: () => cross.classList.remove('hidden'),
        });
      } catch (_) { /* Cal events optional */ }
    }
  }

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- SMOOTH ANCHOR SCROLL (with offset) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 40, 320)}ms`;
    io.observe(el);
  });

  /* ---------- COUNTER ANIMATION ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => counterIO.observe(c));

  /* ---------- PARTICLE BACKGROUND ---------- */
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(1, 1);
      initParticles();
    };

    const COLORS = ['#00d4ff', '#7c5cff', '#ff4ecd'];

    const initParticles = () => {
      const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.15,
      }));
    };

    const linkDist = 140 * (window.devicePixelRatio || 1);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 120 * dpr) {
          const force = (120 * dpr - md) / (120 * dpr);
          p.x += (mdx / md) * force * 1.2;
          p.y += (mdy / md) * force * 1.2;
        }

        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            ctx.globalAlpha = (1 - d / linkDist) * 0.18;
            ctx.strokeStyle = p.c;
            ctx.lineWidth = 0.6 * dpr;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    draw();
  }

  /* ---------- TILT ON CARDS (skip on touch / narrow) ---------- */
  if (!isTouch && window.innerWidth > 880) {
    const tiltCards = document.querySelectorAll('.exp-card, .about-card, .tl-card, .project');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width;
        const cy = (e.clientY - r.top) / r.height;
        const rx = (cy - 0.5) * -4;
        const ry = (cx - 0.5) * 4;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- MOBILE DRAWER ---------- */
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  if (burger && drawer && backdrop) {
    burger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));
    // Drawer's Book-a-Call button: close drawer after Cal popup opens
    drawer.querySelector('.drawer-cta')?.addEventListener('click', () => setTimeout(closeDrawer, 200));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    // Auto-close if viewport grows past breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 880 && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* ---------- HERO PARALLAX BADGES ---------- */
  const badges = document.querySelectorAll('.float-badge');
  if (badges.length) {
    document.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      badges.forEach((b, i) => {
        const depth = (i + 1) * 6;
        b.style.translate = `${cx * depth}px ${cy * depth}px`;
      });
    });
  }

  /* ---------- NAV ACTIVE SECTION ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((l) => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );
  sections.forEach((s) => sectionIO.observe(s));

  /* ---------- CONSOLE EASTER EGG ---------- */
  console.log(
    '%c👋 Hey there.',
    'font-size: 18px; font-weight: 700; color: #00d4ff;'
  );
  console.log(
    '%cInterested in how this was built?\nLet\'s talk: keshavagrawalkka1999@gmail.com',
    'font-size: 13px; color: #9aa0ad;'
  );
})();
