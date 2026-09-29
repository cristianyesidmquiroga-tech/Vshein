document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const topbar = document.querySelector(".topbar");

  // Mobile menu toggle
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  // Close mobile menu on click
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", () => {
      if (nav) {
        nav.classList.remove("is-open");
      }
    });
  });

  // Hide/Show topbar on scroll up/down
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    
    // Only apply hide/show logic if scrolling past a certain threshold (e.g., 100px) to prevent flickering at the very top
    if (currentScrollY > 100) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        topbar.classList.add("nav-hidden");
      } else {
        // Scrolling up
        topbar.classList.remove("nav-hidden");
      }
    } else {
      // At the top, always show
      topbar.classList.remove("nav-hidden");
    }
    
    lastScrollY = currentScrollY;
  });

  // Active section spy
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav a[href^='/#']");

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px", // Adjust these values to change when the section becomes active
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        // Remove active class from all links
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });

        // Add active class to the current link
        const activeLink = document.querySelector(`.nav a[href="/#${id}"]`);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
});

