/* ============================================
   SHEIN VÉLEZ — Main Entry Point (Public)
   Optimized: URL-based images, no blobs
   ============================================ */

// CSS Imports
import '../css/index.css';
import '../css/animations.css';
import '../css/navbar.css';
import '../css/hero.css';
import '../css/products.css';
import '../css/about.css';
import '../css/contact.css';

// JS Modules
import { initCursor } from './cursor.js';
import { initParticles } from './particles.js';
import { initNavbar } from './navbar.js';
import { initAnimations, refreshScrollTriggers } from './animations.js';
import { renderProductCards, initRipple } from './product-card.js';
import { getAllProducts, getProductsByCategory, addProduct, getProductCount, resetProductsDB } from './db.js';

// ============================================
// DEMO PRODUCTS — URL-based, models wearing clothes
// Each "image" entry = a color variant with a model photo
// ============================================
const DEMO_PRODUCTS = [
  {
    name: 'Blusa Floral Elegante',
    category: 'dama',
    description: 'Blusa con estampado floral, tela fresca y ligera perfecta para cualquier ocasión. Diseño exclusivo importado.',
    images: [
      { url: 'https://images.unsplash.com/photo-1515347619362-73ebbb42fcaf?w=500&h=750&fit=crop', color: 'Rosa' },
      { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=750&fit=crop', color: 'Blanco' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    isNew: true,
  },
  {
    name: 'Vestido Cocktail Negro',
    category: 'importaciones',
    description: 'Vestido negro elegante importado, ideal para eventos y cenas especiales. Tela de alta calidad con corte ajustado.',
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=750&fit=crop', color: 'Negro' },
      { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=750&fit=crop', color: 'Rojo' },
    ],
    sizes: ['S', 'M', 'L', '8', '10'],
    isNew: true,
  },
  {
    name: 'Conjunto Casual Verano',
    category: 'dama',
    description: 'Conjunto de dos piezas fresco y cómodo, perfecto para el día a día. Colores vibrantes y diseño moderno.',
    images: [
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop', color: 'Beige' },
      { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=750&fit=crop', color: 'Azul' },
      { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=750&fit=crop', color: 'Blanco' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    name: 'Pantalón Palazzo',
    category: 'dama',
    description: 'Pantalón palazzo de tiro alto con caída elegante. Tela fluida que estiliza la silueta.',
    images: [
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=750&fit=crop', color: 'Rosa' },
      { url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500&h=750&fit=crop', color: 'Negro' },
    ],
    sizes: ['6', '8', '10', '12', '14'],
  },
  {
    name: 'Bolso Elegante',
    category: 'accesorios',
    description: 'Bolso de mano con detalles premium, perfecto para complementar tu outfit. Importado con acabados de lujo.',
    images: [
      { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=750&fit=crop', color: 'Dorado' },
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=750&fit=crop', color: 'Marrón' },
    ],
    sizes: ['Única'],
  },
  {
    name: 'Camisa Oversize',
    category: 'importaciones',
    description: 'Camisa oversize de algodón premium. Estilo minimalista y versátil, combina con todo.',
    images: [
      { url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&h=750&fit=crop', color: 'Blanco' },
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=750&fit=crop', color: 'Beige' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Vestido Niña Princesa',
    category: 'ninos',
    description: 'Hermoso vestido para niña con detalles de tul y lazo. Perfecto para ocasiones especiales.',
    images: [
      { url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&h=750&fit=crop', color: 'Rosa' },
      { url: 'https://images.unsplash.com/photo-1543854589-fdd4d3a0e80e?w=500&h=750&fit=crop', color: 'Blanco' },
    ],
    sizes: ['6', '8', '10', '12'],
  },
  {
    name: 'Collar y Aretes Cristal',
    category: 'accesorios',
    description: 'Set de collar y aretes con cristales brillantes. El toque perfecto de glamour.',
    images: [
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=750&fit=crop', color: 'Dorado' },
      { url: 'https://images.unsplash.com/photo-1515562141589-67f0d99e6e77?w=500&h=750&fit=crop', color: 'Plateado' },
    ],
    sizes: ['Única'],
    isNew: true,
  },
];

async function seedDemoProducts() {
  const count = await getProductCount();
  if (count > 0) {
    // Check if products are URL-based (new format)
    const products = await getAllProducts();
    const firstProduct = products[0];
    // If old blob-based format, reset and re-seed
    if (firstProduct && !firstProduct.images && !firstProduct.frontImageURL) {
      await resetProductsDB();
    } else if (firstProduct && firstProduct.images) {
      return; // Already new format
    } else if (firstProduct && firstProduct.frontImageURL) {
      return; // URL format
    }
  }

  // Seed with URL-based products (no blob downloads!)
  for (const demo of DEMO_PRODUCTS) {
    await addProduct({
      name: demo.name,
      category: demo.category,
      description: demo.description,
      frontImageURL: demo.images[0].url,
      backImageURL: demo.images.length > 1 ? demo.images[1].url : null,
      // Store ALL images as an array of {url, color} objects
      images: demo.images,
      sizes: demo.sizes,
      isNew: demo.isNew || false,
    });
  }
}

// ============================================
// INIT
// ============================================
async function init() {
  // Custom cursor
  initCursor();

  // Navbar
  initNavbar();

  // Hero particles
  initParticles('#hero-particles');

  // Button ripple effect
  initRipple();

  // Seed demo products if empty
  await seedDemoProducts();

  // Load and render products
  await loadProducts('todos');

  // Initialize GSAP animations
  initAnimations();

  // Product filters
  initFilters();

  // Smooth scroll for CTA buttons
  initCTAScroll();

  // WhatsApp floating button
  createWhatsAppFAB();
}

// ============================================
// PRODUCT LOADING
// ============================================
async function loadProducts(category) {
  const grid = document.getElementById('products-grid');
  const products = await getProductsByCategory(category);
  await renderProductCards(products, grid);
  refreshScrollTriggers();
}

// ============================================
// FILTER TABS (Mega-menu category navigation)
// ============================================
function initFilters() {
  const filtersContainer = document.getElementById('products-filters');
  if (!filtersContainer) return;

  filtersContainer.addEventListener('click', async (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;

    const category = tab.dataset.category;
    if (!category) return;

    // Clear ALL active states
    filtersContainer.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    filtersContainer.querySelectorAll('.category-item').forEach(t => t.classList.remove('active'));

    // If it's a column title, make it active
    if (tab.classList.contains('category-column-title')) {
      tab.classList.add('active');
    }
    // If it's a sub-item, make both it AND its parent column title active
    if (tab.classList.contains('category-item')) {
      tab.classList.add('active');
      const parentColumn = tab.closest('.category-column');
      if (parentColumn) {
        const parentTitle = parentColumn.querySelector('.category-column-title');
        if (parentTitle) parentTitle.classList.add('active');
      }
    }

    // Fade out grid, load filtered products, fade in
    const grid = document.getElementById('products-grid');
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(10px)';

    setTimeout(async () => {
      await loadProducts(category);
      grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 250);
  });
}

// ============================================
// CTA SMOOTH SCROLL
// ============================================
function initCTAScroll() {
  document.querySelectorAll('.btn[data-section]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-section');
      const target = document.getElementById(targetId);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// WHATSAPP FLOATING ACTION BUTTON
// ============================================
function createWhatsAppFAB() {
  const fab = document.createElement('a');
  fab.href = 'https://wa.me/573125615080?text=Hola!%20Quiero%20información%20sobre%20sus%20productos';
  fab.target = '_blank';
  fab.className = 'whatsapp-fab';
  fab.setAttribute('aria-label', 'Escríbenos por WhatsApp');
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.586-.828-6.318-2.214l-.44-.362-3.266 1.094 1.094-3.266-.362-.44A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .whatsapp-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
      z-index: 999;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: fab-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 3s both;
    }
    .whatsapp-fab:hover {
      transform: scale(1.1) translateY(-4px);
      box-shadow: 0 8px 30px rgba(37, 211, 102, 0.5);
    }
    .whatsapp-fab svg { width: 28px; height: 28px; }
    .whatsapp-fab::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid rgba(37, 211, 102, 0.3);
      animation: fab-pulse 2s ease-in-out infinite;
    }
    @keyframes fab-entrance {
      from { opacity: 0; transform: scale(0) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes fab-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(fab);
}

// ============================================
// START
// ============================================
document.addEventListener('DOMContentLoaded', init);
