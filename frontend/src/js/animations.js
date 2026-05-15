/* ============================================
   SHEIN VÉLEZ — GSAP Animations
   ============================================ */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  // Wait for page load
  gsap.set('.hero-badge, .hero-title, .hero-subtitle, .hero-cta-group', { opacity: 0, y: 30 });

  // ============================================
  // LOADING SCREEN
  // ============================================
  const loader = document.querySelector('.loading-screen');
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      delay: 2.2,
      ease: 'power2.inOut',
      onComplete: () => {
        loader.classList.add('hidden');
        animateHero();
      }
    });
  } else {
    animateHero();
  }

  // ============================================
  // HERO ANIMATIONS
  // ============================================
  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 })
      .to('.hero-title', { opacity: 1, y: 0, duration: 1 }, '-=0.4')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  // Generic reveal for .reveal elements
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true
    });
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true
    });
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true
    });
  });

  gsap.utils.toArray('.reveal-scale').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
      once: true
    });
  });

  // ============================================
  // PRODUCTS — Staggered entry
  // ============================================
  ScrollTrigger.create({
    trigger: '#productos',
    start: 'top 70%',
    onEnter: () => {
      gsap.utils.toArray('.product-card').forEach((card, i) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power3.out'
        });
      });
    },
    once: true
  });

  // ============================================
  // ABOUT — Parallax + reveal
  // ============================================
  const aboutImage = document.querySelector('.about-image-wrapper');
  if (aboutImage) {
    gsap.to(aboutImage, {
      y: -40,
      scrollTrigger: {
        trigger: '#nosotros',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }

  // ============================================
  // STATS — Counter animation
  // ============================================
  const statNumbers = document.querySelectorAll('.about-stat-number');
  statNumbers.forEach(el => {
    const target = parseInt(el.dataset.count || el.textContent.replace(/\D/g, ''), 10);
    const suffix = el.dataset.suffix || '';
    el.textContent = '0' + suffix;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val).toLocaleString() + suffix;
          }
        });
      },
      once: true
    });
  });

  // ============================================
  // CONTACT — Social cards stagger
  // ============================================
  ScrollTrigger.create({
    trigger: '#contacto',
    start: 'top 70%',
    onEnter: () => {
      gsap.utils.toArray('.social-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, rotateX: 15 },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'power3.out'
          }
        );
      });
    },
    once: true
  });

  // ============================================
  // SECTION LABELS — Slide in
  // ============================================
  gsap.utils.toArray('.section-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // ============================================
  // SECTION TITLES — Fade up
  // ============================================
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // ============================================
  // MARQUEE — Infinite scroll text
  // ============================================
  const marquee = document.querySelector('.marquee-track');
  if (marquee) {
    // Duplicate content for seamless loop
    marquee.innerHTML += marquee.innerHTML;
  }
}

// ============================================
// REFRESH SCROLL TRIGGERS (after dynamic content)
// ============================================
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
