/* ============================================
   SHEIN VÉLEZ — Product Card Interaction
   Zara-style: image gallery with color thumbnails
   No color dots — colors shown as outfit photos
   ============================================ */

// ============================================
// RENDER PRODUCT CARDS
// ============================================
export async function renderProductCards(products, container) {
  if (!container) return;
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <div class="products-empty">
        <div class="products-empty-icon">👗</div>
        <p class="products-empty-text">Próximamente nuevos productos...</p>
      </div>
    `;
    return;
  }

  for (const product of products) {
    const card = createProductCard(product);
    container.appendChild(card);
  }
}

// ============================================
// CREATE SINGLE PRODUCT CARD
// ============================================
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card reveal';
  card.dataset.productId = product.id;
  card.dataset.category = product.category;

  // Build gallery images from the new format
  const galleryImages = getProductImages(product);
  const colorNames = getColorNames(product);
  const sizes = product.sizes || getSizesFromVariants(product);

  // Image progress bars (only if multiple images)
  const barsHTML = galleryImages.length > 1 ? `
    <div class="card-image-bars">
      ${galleryImages.map((_, i) => `<div class="card-bar ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
    </div>
  ` : '';

  // Thumbnail strip — each thumbnail is a color variant photo
  const thumbsHTML = galleryImages.length > 1 ? galleryImages.map((img, i) => `
    <div class="card-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" title="${colorNames[i] || ''}">
      <img src="${img}" alt="${colorNames[i] || `Vista ${i + 1}`}" loading="lazy">
    </div>
  `).join('') : '';

  // Color count text
  const colorCountText = colorNames.length > 1 ? `${colorNames.length} colores: ${colorNames.join(', ')}` : '';

  card.innerHTML = `
    <div class="product-card-inner">
      <div class="product-card-image-wrapper" data-total="${galleryImages.length}">
        ${barsHTML}
        <img class="product-card-image" src="${galleryImages[0]}" alt="${product.name}" loading="lazy" draggable="false">
        ${product.isNew ? '<span class="product-badge new">New</span>' : ''}
        <div class="product-quick-view">
          <button class="quick-view-btn" data-product-id="${product.id}">Ver Detalle</button>
        </div>
      </div>
      ${thumbsHTML ? `<div class="card-thumbs-strip">${thumbsHTML}</div>` : ''}
      <div class="product-card-info">
        <div class="product-category">${getCategoryLabel(product.category)}</div>
        <h3 class="product-name">${product.name}</h3>
        ${colorCountText ? `<p class="product-color-text">${colorCountText}</p>` : ''}
        <div class="product-sizes">
          ${sizes.map(size => `<span class="size-chip available">${size}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Mouse-slide image switch (Zara-style)
  initImageSlide(card, galleryImages);

  // Thumbnail hover to change main image
  initThumbHover(card, galleryImages);

  // Quick view opens modal
  const quickViewBtn = card.querySelector('.quick-view-btn');
  quickViewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openProductModal(product);
  });

  return card;
}

// ============================================
// GET PRODUCT IMAGES — handles old & new format
// ============================================
function getProductImages(product) {
  const images = [];

  // New format: images array with {url, color}
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      if (img.url) images.push(img.url);
      else if (typeof img === 'string') images.push(img);
    });
  }

  // Fallback: frontImageURL / backImageURL
  if (images.length === 0) {
    if (product.frontImageURL) images.push(product.frontImageURL);
    if (product.backImageURL) images.push(product.backImageURL);
  }

  // Ultimate fallback
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500&h=750&fit=crop');
  }

  return images;
}

function getColorNames(product) {
  if (product.images && Array.isArray(product.images)) {
    return product.images.map(img => img.color || '').filter(Boolean);
  }
  return [];
}

function getSizesFromVariants(product) {
  if (product.variants && Array.isArray(product.variants)) {
    return [...new Set(product.variants.map(v => v.size))];
  }
  return [];
}

// ============================================
// IMAGE SLIDE ON MOUSE MOVE (Zara-style)
// ============================================
function initImageSlide(card, images) {
  if (images.length <= 1) return;

  const wrapper = card.querySelector('.product-card-image-wrapper');
  const mainImg = card.querySelector('.product-card-image');
  const bars = card.querySelectorAll('.card-bar');
  const thumbs = card.querySelectorAll('.card-thumb');
  let currentIndex = 0;

  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const newIndex = Math.min(Math.floor(relativeX * images.length), images.length - 1);

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      mainImg.src = images[newIndex];
      bars.forEach((bar, i) => bar.classList.toggle('active', i === newIndex));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === newIndex));
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    currentIndex = 0;
    mainImg.src = images[0];
    bars.forEach((bar, i) => bar.classList.toggle('active', i === 0));
    thumbs.forEach((thumb, i) => thumb.classList.toggle('active', i === 0));
  });
}

// ============================================
// THUMBNAIL HOVER
// ============================================
function initThumbHover(card, images) {
  const thumbs = card.querySelectorAll('.card-thumb');
  const mainImg = card.querySelector('.product-card-image');
  const bars = card.querySelectorAll('.card-bar');

  thumbs.forEach(thumb => {
    thumb.addEventListener('mouseenter', () => {
      const index = parseInt(thumb.dataset.index);
      mainImg.src = images[index];
      thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
      bars.forEach((bar, i) => bar.classList.toggle('active', i === index));
    });
  });
}

// ============================================
// PRODUCT DETAIL MODAL
// ============================================
function openProductModal(product) {
  const overlay = document.getElementById('product-modal-overlay');
  if (!overlay) return;

  const galleryImages = getProductImages(product);
  const colorNames = getColorNames(product);
  const sizes = product.sizes || getSizesFromVariants(product);
  const colorCountText = colorNames.length > 1 ? `Disponible en ${colorNames.length} colores: ${colorNames.join(', ')}` : '';

  overlay.innerHTML = `
    <button class="product-modal-close" id="modal-close">✕</button>
    <div class="product-modal">
      <div class="product-modal-image" id="modal-image-container">
        <img src="${galleryImages[0]}" alt="${product.name}" id="modal-main-image">
        ${galleryImages.length > 1 ? `
          <div class="modal-thumbs">
            ${galleryImages.map((img, i) => `
              <div class="modal-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="${img}" alt="${colorNames[i] || `Vista ${i + 1}`}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="product-modal-details">
        <span class="modal-category">${getCategoryLabel(product.category)}</span>
        <h2 class="modal-name">${product.name}</h2>
        <p class="modal-description">${product.description || 'Sin descripción disponible.'}</p>
        ${colorCountText ? `<p class="modal-color-info">${colorCountText}</p>` : ''}
        
        <p class="modal-section-title">Tallas Disponibles</p>
        <div class="modal-sizes">
          ${sizes.map(size => `<span class="modal-size-chip available">${size}</span>`).join('')}
        </div>

        <a href="https://wa.me/573125615080?text=${encodeURIComponent(`Hola! Me interesa: ${product.name}`)}" target="_blank" class="modal-whatsapp-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.913.913l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.586-.828-6.318-2.214l-.44-.362-3.266 1.094 1.094-3.266-.362-.44A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          Preguntar por WhatsApp
        </a>
      </div>
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Modal thumb hover
  const modalThumbs = overlay.querySelectorAll('.modal-thumb');
  const modalMainImg = overlay.querySelector('#modal-main-image');
  modalThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index);
      modalMainImg.src = galleryImages[idx];
      modalThumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
    });
  });

  // Close
  const closeBtn = overlay.querySelector('#modal-close');
  closeBtn.addEventListener('click', () => closeModal(overlay));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeModal(overlay);
      document.removeEventListener('keydown', escHandler);
    }
  });
}

function closeModal(overlay) {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// HELPERS
// ============================================
export function getCategoryLabel(category) {
  const labels = {
    'importaciones': 'Importaciones',
    'dama': 'Dama',
    'ninos': 'Niños',
    'accesorios': 'Accesorios',
  };
  return labels[category] || category;
}

// ============================================
// RIPPLE EFFECT
// ============================================
export function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}
