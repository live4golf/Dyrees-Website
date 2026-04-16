/* ============================================
   DYREES — Main JavaScript
   Scroll animations, nav, mobile menu, form,
   3D calendar block spawner
   ============================================ */

// ---------- 3D CALENDAR BLOCK SPAWNER ----------
(function calendarSpawner() {
  'use strict';

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  // Generate an accurate month grid (Mon-start)
  function buildMonthData(year, month) {
    const firstDay  = new Date(year, month, 1).getDay();  // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Convert Sun=0 to Mon-start offset (Mon=0, Sun=6)
    const offset = (firstDay + 6) % 7;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push('');
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push('');
    return { name: MONTHS[month] + ' ' + year, cells, daysInMonth };
  }

  // Build a DOM element for a calendar block
  function createCalBlock(container) {
    // Pick a random month within ±6 months of now
    const now = new Date();
    const offsetMonths = Math.floor(Math.random() * 12) - 3;
    const d = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
    const data = buildMonthData(d.getFullYear(), d.getMonth());

    // Detect if this is the current month
    const isCurrentMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    const today = now.getDate();

    const el = document.createElement('div');
    el.className = 'cal-block';

    // Header
    const header = document.createElement('div');
    header.className = 'cal-block__header';
    header.textContent = data.name;
    el.appendChild(header);

    // Day names row
    const daysRow = document.createElement('div');
    daysRow.className = 'cal-block__days';
    DAYS.forEach(day => {
      const s = document.createElement('span');
      s.textContent = day;
      daysRow.appendChild(s);
    });
    el.appendChild(daysRow);

    // Date grid
    const grid = document.createElement('div');
    grid.className = 'cal-block__grid';
    data.cells.forEach(cell => {
      const s = document.createElement('span');
      s.textContent = cell;
      if (isCurrentMonth && cell === today) {
        s.className = 'cal-block__today';
      }
      grid.appendChild(s);
    });
    el.appendChild(grid);

    // Random position across the hero area
    const xPos = 5 + Math.random() * 80;   // 5% to 85%
    const yPos = 5 + Math.random() * 80;   // 5% to 85%
    el.style.left = xPos + '%';
    el.style.top  = yPos + '%';

    // Random 3D rotation angles via CSS custom properties
    const rx = -20 + Math.random() * 40;  // -20° to +20°
    const ry = -30 + Math.random() * 60;  // -30° to +30°
    el.style.setProperty('--rx', rx + 'deg');
    el.style.setProperty('--ry', ry + 'deg');

    // --- Position-based shadow & lighting ---
    // Light source at hero center (50%, 40%)
    const dx = xPos - 50;  // negative = tile is left of center
    const dy = yPos - 40;  // negative = tile is above center

    // Shadow falls AWAY from center (opposite direction of light)
    // Add rotation influence: tilt shifts the shadow
    const shadowX = Math.round(dx * 0.15 + ry * 0.12);
    const shadowY = Math.round(dy * 0.15 + rx * -0.1);

    // Clamp to reasonable range
    const sx = Math.max(-10, Math.min(10, shadowX));
    const sy = Math.max(-10, Math.min(10, shadowY));

    el.style.setProperty('--sx', sx + 'px');
    el.style.setProperty('--sy', sy + 'px');

    // Edge thickness direction (same as shadow but smaller)
    el.style.setProperty('--edge-x', Math.round(sx * 0.4) + 'px');
    el.style.setProperty('--edge-y', Math.round(sy * 0.4) + 'px');

    // Gradient highlight direction: light comes FROM center, so highlight
    // is on the side facing the center
    const gradAngle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI) + 180);
    el.style.setProperty('--grad-angle', gradAngle + 'deg');

    // Random animation duration (8–14s)
    const duration = 8 + Math.random() * 6;
    el.style.animationDuration = duration + 's';

    // Remove from DOM when animation ends
    el.addEventListener('animationend', () => el.remove());

    container.appendChild(el);
  }

  // Start once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('heroCalendars');
    if (!container) return;

    // Initial burst
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createCalBlock(container), i * 400);
    }

    // Continuous spawning
    let spawnInterval = setInterval(() => createCalBlock(container), 1200);

    // Pause when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(spawnInterval);
      } else {
        spawnInterval = setInterval(() => createCalBlock(container), 1200);
      }
    });
  });
})();



document.addEventListener('DOMContentLoaded', () => {



  // ---------- NAVBAR: background on scroll ----------
  const nav = document.getElementById('nav');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // initial check

  // ---------- MOBILE HAMBURGER ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('.nav__link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- SCROLL ANIMATIONS (Intersection Observer) ----------
  const animatedEls = document.querySelectorAll('.feature-card, .feat-item, .feat-diff-item');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    animatedEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: just show everything
    animatedEls.forEach(el => el.classList.add('visible'));
  }

  // ---------- SMOOTH SCROLL for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- FORM SUBMISSION ----------
  const form      = document.getElementById('betaForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name  = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();

    if (!name || !email) {
      formStatus.textContent = 'Please fill in your name and email.';
      formStatus.className   = 'form__status form__status--error';
      return;
    }

    // Disable button
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        formStatus.textContent = '🎉 Thank you! We\'ll be in touch soon.';
        formStatus.className   = 'form__status form__status--success';
        form.reset();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      formStatus.textContent = 'Something went wrong. Please try again.';
      formStatus.className   = 'form__status form__status--error';
      console.error('Form error:', err);
    } finally {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = `Send Request <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>`;
    }
  });

});
