/* ============================================
   SHEIN VÉLEZ — Navbar Logic
   ============================================ */

export function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar-toggle');
  const overlay = document.querySelector('.navbar-mobile-overlay');
  const mobileLinks = overlay ? overlay.querySelectorAll('.nav-link') : [];
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  if (!navbar) return;

  // Scroll effect — glassmorphism on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // Mobile toggle
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      const isActive = toggle.classList.contains('active');
      toggle.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = isActive ? '' : 'hidden';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll to section
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-section');
      const target = document.getElementById(targetId);
      if (target) {
        const offset = navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Active section indicator
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-section') === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-100px 0px -40% 0px' });

  sections.forEach(section => observer.observe(section));
}
