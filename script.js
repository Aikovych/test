/* ============================================================
   script.js — Диван «Плейн» Landing Page
   ============================================================ */

'use strict';

/* ============================================================
   CONTACT — TODO: вставте номер телефону та нікнейми
   ============================================================ */
const PHONE_NUMBER = '+380638479971';
const VIBER_NUMBER = '+380638479971';
const TELEGRAM_USERNAME = 'your_telegram'; // TODO: вставте Telegram username (без @)

/* ============================================================
   CTA HANDLERS
   ============================================================ */
function handleOrder() {
  window.location.href = `tel:${PHONE_NUMBER}`;
}

function handleViber() {
  // Viber deep link format: viber://chat?number=<international_number_without_plus>
  const cleaned = VIBER_NUMBER.replace(/\D/g, '');
  window.location.href = `viber://chat?number=${cleaned}`;
}

function handleTelegram() {
  window.open(`https://t.me/${TELEGRAM_USERNAME}`, '_blank', 'noopener,noreferrer');
}

/* ============================================================
   NAVIGATION — scroll state & burger menu
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('navMobile');

  // Scroll state
  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init

  // Burger toggle
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.classList.toggle('active', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a mobile link is clicked
    mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', false);
      });
    });
  }
})();

/* ============================================================
   SMOOTH SCROLL for nav links
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   INTERSECTION OBSERVER — scroll animations
   ============================================================ */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));

  // Immediately reveal elements already in viewport on load
  window.addEventListener('load', () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  });
})();

/* ============================================================
   HERO — ken burns effect on load
   ============================================================ */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (hero) {
    // Slight delay to allow CSS transition to start
    requestAnimationFrame(() => {
      setTimeout(() => hero.classList.add('loaded'), 100);
    });
  }
})();

/* ============================================================
   GALLERY SLIDER
   ============================================================ */
(function initSlider() {
  const track = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const dotsContainer = document.getElementById('sliderDots');
  const thumbs = document.querySelectorAll('.slider__thumb');

  if (!track) return;

  const slides = track.querySelectorAll('.slider__slide');
  const totalSlides = slides.length;
  let current = 0;
  let autoplayTimer = null;
  let isTransitioning = false;

  // --- Build dots ---
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Фото ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider__dot');

  // --- Core navigation ---
  function goTo(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    current = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Update thumbnails
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === current);
    });

    // Scroll active thumb into view — use scrollLeft directly to avoid page scroll jump
    const activeThumb = document.querySelector('.slider__thumb.active');
    if (activeThumb) {
      const thumbsContainer = document.getElementById('sliderThumbs');
      if (thumbsContainer) {
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const containerWidth = thumbsContainer.offsetWidth;
        thumbsContainer.scrollLeft = thumbLeft - containerWidth / 2 + thumbWidth / 2;
      }
    }

    setTimeout(() => { isTransitioning = false; }, 650);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // --- Button listeners ---
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // --- Thumbnail click ---
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const index = parseInt(thumb.dataset.index, 10);
      if (!isNaN(index)) goTo(index);
    });
  });

  // --- Autoplay disabled — was causing page scroll interference ---
  function startAutoplay() { /* disabled */ }
  function stopAutoplay() { /* disabled */ }
  function resetAutoplay() { /* disabled */ }

  // --- Keyboard navigation ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // --- Touch / swipe support ---
  let touchStartX = 0;
  let touchEndX = 0;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? next() : prev();
    }
  }, { passive: true });
})();

/* ============================================================
   KENTUCKY MODAL
   ============================================================ */
(function initKentuckyModal() {
  const modal = document.getElementById('kentuckyModal');
  const track = document.getElementById('modalTrack');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');
  const dotsContainer = document.getElementById('modalDots');

  if (!modal || !track) return;

  const slides = track.querySelectorAll('img');
  const total = slides.length;
  let current = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Фото ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider__dot');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) d > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  // Expose open/close globally
  window.openKentucky = function() {
    goTo(0);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeKentucky = function(e) {
    if (e && e.target !== modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================================
   BOSTON MODAL
   ============================================================ */
(function initBostonModal() {
  const modal = document.getElementById('bostonModal');
  const track = document.getElementById('bostonTrack');
  const prevBtn = document.getElementById('bostonPrev');
  const nextBtn = document.getElementById('bostonNext');
  const dotsContainer = document.getElementById('bostonDots');

  if (!modal || !track) return;

  const slides = track.querySelectorAll('img');
  const total = slides.length;
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Фото ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider__dot');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) d > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  window.openBoston = function() {
    goTo(0);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeBoston = function(e) {
    if (e && e.target !== modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================================
   FOTEL MODAL
   ============================================================ */
(function initFotelModal() {
  const modal = document.getElementById('fotelModal');
  const track = document.getElementById('fotelTrack');
  const prevBtn = document.getElementById('fotelPrev');
  const nextBtn = document.getElementById('fotelNext');
  const dotsContainer = document.getElementById('fotelDots');

  if (!modal || !track) return;

  const slides = track.querySelectorAll('img');
  const total = slides.length;
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Фото ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.slider__dot');

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) d > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });

  window.openFotel = function() {
    goTo(0);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeFotel = function(e) {
    if (e && e.target !== modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ============================================================
   GENERIC MODAL FACTORY
   ============================================================ */
function createModal(ids) {
  const modal = document.getElementById(ids.modal);
  const track = document.getElementById(ids.track);
  const prevBtn = document.getElementById(ids.prev);
  const nextBtn = document.getElementById(ids.next);
  const dotsContainer = document.getElementById(ids.dots);
  if (!modal || !track) return;
  const slides = track.querySelectorAll('img');
  const total = slides.length;
  let current = 0;
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.slider__dot');
  function goTo(i) {
    current = (i + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === current));
  }
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) d > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });
  window[ids.open] = function() { goTo(0); modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  window[ids.close] = function(e) { if (e && e.target !== modal) return; modal.classList.remove('open'); document.body.style.overflow = ''; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.remove('open'); document.body.style.overflow = ''; } });
}

createModal({ modal: 'fotelDoubleModal', track: 'fotelDoubleTrack', prev: 'fotelDoublePrev', next: 'fotelDoubleNext', dots: 'fotelDoubleDots', open: 'openFotelDouble', close: 'closeFotelDouble' });
createModal({ modal: 'tvistModal', track: 'tvistTrack', prev: 'tvistPrev', next: 'tvistNext', dots: 'tvistDots', open: 'openTvist', close: 'closeTvist' });
createModal({ modal: 'novaModal', track: 'novaTrack', prev: 'novaPrev', next: 'novaNext', dots: 'novaDots', open: 'openNova', close: 'closeNova' });
