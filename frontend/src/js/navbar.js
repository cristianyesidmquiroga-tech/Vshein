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

  // Active section indicator (ScrollSpy preciso)
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY;
    const scrollPosition = scrollY + navbar.offsetHeight + 50; // Offset visual

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    // Forzar la última sección si llegamos al fondo exacto de la página
    if ((window.innerHeight + Math.round(scrollY)) >= document.body.offsetHeight - 50) {
      current = sections[sections.length - 1].getAttribute('id');
    }

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('active');
        }
      });
    }
  });
}
