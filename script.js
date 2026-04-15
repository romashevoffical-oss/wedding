/* ═══════════════════════════════════════════════
   WEDDING SITE — script.js
   Тёма & Саша · 08.07.2026
   ═══════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. COUNTDOWN TIMER
   ───────────────────────────────────────── */

function updateCountdown() {
  const target = new Date('2026-07-08T13:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    document.getElementById('cnt-days').textContent  = '00';
    document.getElementById('cnt-hours').textContent = '00';
    document.getElementById('cnt-mins').textContent  = '00';
    document.getElementById('cnt-secs').textContent  = '00';
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  document.getElementById('cnt-days').textContent  = pad(days);
  document.getElementById('cnt-hours').textContent = pad(hours);
  document.getElementById('cnt-mins').textContent  = pad(mins);
  document.getElementById('cnt-secs').textContent  = pad(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* ─────────────────────────────────────────
   2. CALENDAR — July 2026
   ───────────────────────────────────────── */

function buildCalendar() {
  const body        = document.getElementById('cal-body');
  const year        = 2026;
  const month       = 6; // July (0-indexed)
  const weddingDay  = 8;

  // July 1, 2026 = Wednesday = index 2 (Mon=0)
  const firstDay    = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Monday-first (Mon=0 … Sun=6)
  const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 31

  // Empty cells before 1st
  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('span');
    el.className = 'cal-empty';
    el.textContent = '';
    body.appendChild(el);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date     = new Date(year, month, d);
    const weekday  = date.getDay(); // 0=Sun,6=Sat

    const el = document.createElement('span');
    el.textContent = d;

    if (d === weddingDay) {
      el.className = 'cal-special';
      el.setAttribute('title', 'Свадьба Тёмы и Саши 💍');
    } else if (weekday === 0) {
      el.className = 'cal-sun';
    } else if (weekday === 6) {
      el.className = 'cal-sat';
    } else {
      el.className = '';
    }

    body.appendChild(el);
  }
}

buildCalendar();


/* ─────────────────────────────────────────
   3. SCROLL-REVEAL — Intersection Observer
   ───────────────────────────────────────── */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);

      setTimeout(() => {
        el.classList.add('visible');
      }, delay);

      // Once revealed — unobserve
      revealObserver.unobserve(el);
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  }
);

document.querySelectorAll('.scroll-reveal').forEach(el => {
  revealObserver.observe(el);
});


/* ─────────────────────────────────────────
   4. FADE-UP re-trigger for story screens
   Each screen triggers its .fade-up items
   when the section enters viewport
   ───────────────────────────────────────── */

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const screen   = entry.target;
      const fadeEls  = screen.querySelectorAll('.fade-up');

      fadeEls.forEach((el, i) => {
        // Reset then re-play animation
        el.style.animation = 'none';
        void el.offsetHeight; // reflow
        el.style.animation  = '';
        el.style.animationDelay = (i * 0.18) + 's';
      });
    });
  },
  { threshold: 0.4 }
);

document.querySelectorAll('.story-screen').forEach(sec => {
  storyObserver.observe(sec);
});


/* ─────────────────────────────────────────
   5. STAGGERED PHOTO ANIMATION
   Extra stagger for photo cards in screen-2
   ───────────────────────────────────────── */

const photoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const screen = entry.target;
      const cards  = screen.querySelectorAll('.photo-card, .photo-divider');

      cards.forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(48px)';
        card.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.22}s,
                                  transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.22}s`;

        // Trigger on next frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          });
        });
      });

      photoObserver.unobserve(screen);
    });
  },
  { threshold: 0.35 }
);



/* ─────────────────────────────────────────
   6. VENUE GALLERY — parallax-lite on scroll
   ───────────────────────────────────────── */

function handleGalleryParallax() {
  const gallery = document.querySelector('.venue-gallery');
  if (!gallery) return;

  const rect = gallery.getBoundingClientRect();
  const wh   = window.innerHeight;

  if (rect.top > wh || rect.bottom < 0) return;

  const progress = 1 - rect.top / wh; // 0 → 1 as it enters viewport

  gallery.querySelectorAll('.venue-img img').forEach((img, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    const shift     = direction * progress * 12;
    img.style.transform = `scale(1.06) translateY(${shift}px)`;
  });
}

window.addEventListener('scroll', handleGalleryParallax, { passive: true });
handleGalleryParallax();


/* ─────────────────────────────────────────
   7. RSVP FORM
   ───────────────────────────────────────── */

const rsvpForm    = document.getElementById('rsvp-form');
const formSuccess = document.getElementById('form-success');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name     = document.getElementById('f-name').value.trim();
    const attend   = rsvpForm.querySelector('input[name="attend"]:checked');
    const guests   = document.getElementById('f-guests').value;
    const allergies = document.getElementById('f-allergies').value.trim();
    const comment  = document.getElementById('f-comment').value.trim();

    if (!name) {
      shakeField(document.getElementById('f-name'));
      return;
    }

    if (!attend) {
      const radioGroup = rsvpForm.querySelector('.radio-group');
      shakeField(radioGroup);
      return;
    }

    // Log to console (replace with real backend call)
    console.log('RSVP:', { name, attend: attend.value, guests, allergies, comment });

    // Show success
    rsvpForm.style.transition = 'opacity 0.4s';
    rsvpForm.style.opacity    = '0';

    setTimeout(() => {
      rsvpForm.style.display = 'none';
      formSuccess.classList.add('visible');
    }, 400);
  });
}

function shakeField(el) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'shake 0.45s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
}

// Inject shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);


/* ─────────────────────────────────────────
   8. SMOOTH SCROLL for any anchor links
   ───────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ─────────────────────────────────────────
   9. PASSIVE PERFORMANCE — reduce paint on scroll
   ───────────────────────────────────────── */

let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
