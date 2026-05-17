// Smooth Scrolling Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Animation
gsap.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    delay: 0.2
});

gsap.from('.hero-subtitle', {
    y: 50,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    delay: 0.4
});

gsap.from('.btn-explore', {
    y: 50,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    delay: 0.6
});

// Product Cards Parallax/Fade in
gsap.utils.toArray('.product-card').forEach(card => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
});

// Image Gallery Logic
document.querySelectorAll('.product-media-gallery').forEach(gallery => {
    const images = gallery.querySelectorAll('.product-img');
    const dots = gallery.querySelectorAll('.dot');
    let currentIndex = 0;
    
    // Auto cycle (optional, or just click)
    // For now, let's make it change on dot click
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Remove active class
            images[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            // Set new active
            currentIndex = index;
            images[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
