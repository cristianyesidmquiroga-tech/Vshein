/* ============================================
   SHEIN VÉLEZ — Custom Cursor
   ============================================ */

export function initCursor() {
  // Skip on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth follow for ring
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states
  const hoverTargets = 'a, button, .btn, .filter-tab, .nav-link, .social-card, .quick-view-btn, input, textarea, select';
  const cardTargets = '.product-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(cardTargets)) {
      document.body.classList.add('cursor-card');
      document.body.classList.remove('cursor-hover');
    } else if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-card');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets) || e.target.closest(cardTargets)) {
      document.body.classList.remove('cursor-hover', 'cursor-card');
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}
