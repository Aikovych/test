/* ===== FORMA — script.js ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ===== CUSTOM CURSOR ===== */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  // Smooth cursor lag
  (function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  })();

  document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));
  document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));

  // Hover expansion
  const hoverEls = document.querySelectorAll('a, button, .col-card, .col-track');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });


  /* ===== NAV SCROLL ===== */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });


  /* ===== MOBILE MENU ===== */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const spans = burger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    });
  });


  /* ===== HERO SLIDESHOW ===== */
  const slides  = document.querySelectorAll('.hero-slide');
  const dots    = document.querySelectorAll('.dot');
  const slideNum = document.getElementById('slideNum');
  let current   = 0;
  let slideTimer;

  function goSlide(idx) {
    slides[current].classList.remove('active');
    slides[current].classList.add('prev');
    dots[current].classList.remove('active');

    setTimeout(() => slides[current].classList.remove('prev'), 1400);

    current = idx;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    slideNum.textContent = String(current + 1).padStart(2, '0');
  }

  function nextSlide() {
    goSlide((current + 1) % slides.length);
  }

  function startTimer() {
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 5500);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goSlide(Number(dot.dataset.index));
      startTimer();
    });
  });

  startTimer();


  /* ===== COLLECTIONS CAROUSEL ===== */
  const colTrack = document.getElementById('colTrack');
  const colPrev  = document.getElementById('colPrev');
  const colNext  = document.getElementById('colNext');
  const cards    = colTrack.querySelectorAll('.col-card');
  const cardW    = 380 + 24; // card width + gap
  let colIndex   = 0;
  const maxIndex = cards.length - Math.floor(colTrack.parentElement.offsetWidth / cardW);

  function updateCarousel() {
    const maxI = Math.max(0, cards.length - Math.floor(colTrack.parentElement.offsetWidth / cardW));
    colIndex = Math.max(0, Math.min(colIndex, maxI));
    colTrack.style.transform = `translateX(-${colIndex * cardW}px)`;
    colPrev.disabled = colIndex === 0;
    colNext.disabled = colIndex >= maxI;
  }

  colPrev.addEventListener('click', () => { colIndex--; updateCarousel(); });
  colNext.addEventListener('click', () => { colIndex++; updateCarousel(); });

  // Touch swipe
  let touchStartX = 0;
  colTrack.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
  colTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) colIndex++;
      else colIndex--;
      updateCarousel();
    }
  });

  // Drag to scroll on desktop
  let isDragging = false, dragStartX = 0, dragStartIndex = 0;
  colTrack.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartIndex = colIndex;
    colTrack.style.transition = 'none';
  });
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      colTrack.style.transition = '';
      updateCarousel();
    }
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const diff = dragStartX - e.clientX;
    colIndex = dragStartIndex + Math.round(diff / cardW);
    updateCarousel();
  });

  updateCarousel();


  /* ===== FULLSCREEN MATERIAL GALLERY (scroll-driven) ===== */
  const gallerySection = document.querySelector('.gallery-fs');
  const galleryInner   = document.getElementById('galleryInner');
  const gfsPanels      = galleryInner.querySelectorAll('.gfs-panel');
  const gfsProgress    = document.getElementById('gfsProgress');
  let gfsCurrent       = 0;
  let gfsLocked        = false;
  let gfsAuto;

  function goPanel(idx) {
    gfsCurrent = Math.max(0, Math.min(idx, gfsPanels.length - 1));
    galleryInner.style.transform = `translateX(-${gfsCurrent * 100}%)`;
    gfsProgress.style.width = '0%';
    setTimeout(() => { gfsProgress.style.width = '100%'; }, 50);
  }

  function startGfsAuto() {
    clearInterval(gfsAuto);
    gfsAuto = setInterval(() => {
      const next = (gfsCurrent + 1) % gfsPanels.length;
      goPanel(next);
    }, 5200);
  }

  // IntersectionObserver — start auto on enter
  const gfsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        goPanel(0);
        startGfsAuto();
      } else {
        clearInterval(gfsAuto);
      }
    });
  }, { threshold: 0.5 });
  gfsObserver.observe(gallerySection);

  // Click to advance panels
  gallerySection.addEventListener('click', () => {
    const next = (gfsCurrent + 1) % gfsPanels.length;
    goPanel(next);
    startGfsAuto();
  });

  goPanel(0);
  startGfsAuto();


  /* ===== SCROLL REVEAL ===== */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ===== PARALLAX on hero image (mouse tilt) ===== */
  const heroSlides = document.querySelectorAll('.hero-slide');
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    heroSlides.forEach(s => {
      s.style.transform = s.classList.contains('active')
        ? `scale(1) translate(${x}px, ${y}px)`
        : `scale(1.06) translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
  });


  /* ===== COUNTER ANIMATION ===== */
  const nums = document.querySelectorAll('.num');
  const numObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d.]+)(.*)$/);
      if (!match) return;
      const end = parseFloat(match[1]);
      const suffix = match[2];
      let start = 0;
      const duration = 1800;
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = start + (end - start) * ease;
        el.textContent = (Number.isInteger(end) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      numObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => numObserver.observe(n));


  /* ===== FORM SUBMIT ===== */
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    btn.textContent = 'Відправляємо...';
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.textContent = '✓ Заявку отримано!';
      btn.style.opacity = '1';
      btn.style.background = '#4a7c59';
      btn.style.borderColor = '#4a7c59';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Надіслати заявку';
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 4000);
    }, 1200);
  });


  /* ===== IMAGE lazy loading shimmer ===== */
  document.querySelectorAll('.col-img').forEach(el => {
    const img = new Image();
    const url = el.style.backgroundImage.slice(5, -2);
    el.style.backgroundColor = '#1a1916';
    img.onload = () => { el.style.backgroundImage = `url('${url}')`; };
    img.src = url;
  });

});
