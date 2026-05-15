/* ============================================
   SHEIN VÉLEZ — Admin Panel Logic
   ============================================ */

// CSS
import '../css/index.css';
import '../css/animations.css';
import '../css/admin.css';

// DB
import {
  authenticateUser, getCurrentSession, logout,
  addProduct, updateProduct, deleteProduct, getAllProducts, getProduct, getProductStats,
  getAllUsers, addUser, deleteUser,
  blobToDataURL, fileToBlob
} from './db.js';
import { getCategoryLabel } from './product-card.js';

// ============================================
// STATE
// ============================================
let currentSession = null;
let selectedSizes = [];
let selectedColors = [];
let frontImageBlob = null;
let backImageBlob = null;
let deleteTargetId = null;
let deleteTargetType = null; // 'product' or 'user'

// ============================================
// INIT
// ============================================
function init() {
  currentSession = getCurrentSession();
  if (currentSession) {
    showDashboard();
  } else {
    showLogin();
  }
}

// ============================================
// AUTH
// ============================================
function showLogin() {
  document.getElementById('login-view').style.display = '';
  document.getElementById('dashboard-view').style.display = 'none';

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');

    const session = await authenticateUser(username, password);
    if (session) {
      currentSession = session;
      showDashboard();
    } else {
      errorEl.classList.add('visible');
      setTimeout(() => errorEl.classList.remove('visible'), 3000);
    }
  });
}

function showDashboard() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = '';

  // Set user info
  document.getElementById('admin-user-name').textContent = currentSession.displayName || currentSession.username;
  const badge = document.getElementById('admin-user-badge');
  badge.textContent = currentSession.role === 'admin' ? 'Admin' : 'Trabajador';
  badge.className = `admin-user-badge role-${currentSession.role}`;

  // Show users tab only for admin
  if (currentSession.role === 'admin') {
    document.querySelectorAll('.users-tab').forEach(el => el.style.display = '');
    document.querySelectorAll('.users-section').forEach(el => el.classList.add('visible'));
  }

  // Init dashboard
  initTabNavigation();
  initProductForm();
  initImageUpload();
  initSizeToggles();
  initColorToggles();
  initLogout();
  initConfirmModal();
  initSearch();
  initUserManagement();
  
  loadDashboard();
}

// ============================================
// TAB NAVIGATION
// ============================================
function initTabNavigation() {
  const navLinks = document.querySelectorAll('.admin-nav-link[data-tab]');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Remove active from all
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Hide all tabs
      document.querySelectorAll('.admin-tab-content').forEach(tab => tab.style.display = 'none');

      // Show selected tab
      const tabId = `tab-${link.dataset.tab}`;
      const tab = document.getElementById(tabId);
      if (tab) tab.style.display = '';

      // Reset form if navigating to add product
      if (link.dataset.tab === 'add-product') {
        resetProductForm();
      }
    });
  });
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboard() {
  const stats = await getProductStats();
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-in-stock').textContent = stats.inStock;
  document.getElementById('stat-low').textContent = stats.lowStock;
  document.getElementById('stat-out').textContent = stats.outOfStock;

  await loadProductsTable();
  if (currentSession.role === 'admin') {
    await loadUsersTable();
  }
}

// ============================================
// PRODUCTS TABLE
// ============================================
async function loadProductsTable(searchQuery = '') {
  const tbody = document.getElementById('products-table-body');
  const empty = document.getElementById('products-table-empty');
  let products = await getAllProducts();

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';

  let html = '';
  for (const p of products) {
    const thumbURL = await blobToDataURL(p.frontImage);
    const variants = p.variants || [];
    const sizes = [...new Set(variants.map(v => v.size))].join(', ');
    const colors = [...new Set(variants.map(v => v.color))];
    const hasStock = variants.some(v => v.inStock);
    const allOut = variants.length > 0 && variants.every(v => !v.inStock);
    const fewStock = variants.filter(v => v.inStock).length <= 2 && !allOut;

    let stockClass = 'in-stock';
    let stockText = 'Disponible';
    if (allOut) { stockClass = 'out-of-stock'; stockText = 'Agotado'; }
    else if (fewStock) { stockClass = 'low-stock'; stockText = 'Stock Bajo'; }

    html += `
      <tr data-id="${p.id}">
        <td>
          <div class="table-product-cell">
            ${thumbURL ? `<img class="table-product-thumb" src="${thumbURL}" alt="${p.name}">` : ''}
            <div>
              <div class="table-product-name">${p.name}</div>
              <div class="table-product-cat">${getCategoryLabel(p.category)}</div>
            </div>
          </div>
        </td>
        <td>${getCategoryLabel(p.category)}</td>
        <td>${sizes || '—'}</td>
        <td>
          <div style="display:flex; gap:4px;">
            ${colors.map(c => `<span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${c}; border:1px solid rgba(0,0,0,0.1);"></span>`).join('')}
          </div>
        </td>
        <td><span class="stock-badge ${stockClass}">${stockText}</span></td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${new Date(p.createdAt).toLocaleDateString('es-CO')}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn edit" data-edit-id="${p.id}" title="Editar">✏️</button>
            <button class="table-action-btn delete" data-delete-id="${p.id}" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = html;

  // Attach edit/delete handlers
  tbody.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.editId)));
  });

  tbody.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTargetId = parseInt(btn.dataset.deleteId);
      deleteTargetType = 'product';
      const overlay = document.getElementById('confirm-overlay');
      overlay.querySelector('.confirm-title').textContent = '¿Eliminar producto?';
      overlay.querySelector('.confirm-text').textContent = 'Esta acción no se puede deshacer. El producto será eliminado permanentemente.';
      overlay.classList.add('active');
    });
  });
}

// ============================================
// PRODUCT FORM
// ============================================
function initProductForm() {
  const form = document.getElementById('product-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value.trim();

    if (!name || !category) {
      showToast('Completa los campos obligatorios', 'error');
      return;
    }

    if (!editId && !frontImageBlob) {
      showToast('Sube al menos la imagen frontal', 'error');
      return;
    }

    // Build variants from selected sizes and colors
    const variants = [];
    if (selectedSizes.length > 0 && selectedColors.length > 0) {
      selectedSizes.forEach(size => {
        selectedColors.forEach(color => {
          variants.push({ size, color, inStock: true });
        });
      });
    } else if (selectedSizes.length > 0) {
      selectedSizes.forEach(size => {
        variants.push({ size, color: '#000000', inStock: true });
      });
    } else if (selectedColors.length > 0) {
      selectedColors.forEach(color => {
        variants.push({ size: 'Única', color, inStock: true });
      });
    }

    const productData = { name, category, description, variants };
    if (frontImageBlob) productData.frontImage = frontImageBlob;
    if (backImageBlob) productData.backImage = backImageBlob;

    try {
      if (editId) {
        await updateProduct(parseInt(editId), productData);
        showToast('Producto actualizado ✨', 'success');
      } else {
        await addProduct(productData);
        showToast('Producto agregado ✨', 'success');
      }

      resetProductForm();
      // Switch to products tab
      document.querySelector('[data-tab="products"]').click();
      await loadDashboard();
    } catch (err) {
      showToast('Error al guardar: ' + err.message, 'error');
    }
  });

  // Cancel button
  document.getElementById('cancel-form-btn').addEventListener('click', () => {
    resetProductForm();
    document.querySelector('[data-tab="products"]').click();
  });
}

async function editProduct(id) {
  const product = await getProduct(id);
  if (!product) return;

  // Switch to add product tab
  document.querySelector('[data-tab="add-product"]').click();

  document.getElementById('form-title').textContent = 'Editar Producto';
  document.getElementById('edit-product-id').value = id;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-category').value = product.category;
  document.getElementById('product-description').value = product.description || '';

  // Sizes
  selectedSizes = [...new Set((product.variants || []).map(v => v.size))];
  document.querySelectorAll('.size-toggle').forEach(btn => {
    btn.classList.toggle('selected', selectedSizes.includes(btn.dataset.size));
  });

  // Colors
  selectedColors = [...new Set((product.variants || []).map(v => v.color))];
  document.querySelectorAll('.color-toggle').forEach(btn => {
    btn.classList.toggle('selected', selectedColors.includes(btn.dataset.color));
  });

  // Images
  frontImageBlob = product.frontImage;
  backImageBlob = product.backImage || null;
  if (frontImageBlob) {
    showImagePreview('front-image-preview', frontImageBlob, 'Frontal');
  }
  if (backImageBlob) {
    showImagePreview('back-image-preview', backImageBlob, 'Trasera');
  }
}

function resetProductForm() {
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  document.getElementById('form-title').textContent = 'Agregar Producto';
  selectedSizes = [];
  selectedColors = [];
  frontImageBlob = null;
  backImageBlob = null;
  document.querySelectorAll('.size-toggle').forEach(btn => btn.classList.remove('selected'));
  document.querySelectorAll('.color-toggle').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('front-image-preview').innerHTML = '';
  document.getElementById('back-image-preview').innerHTML = '';
}

// ============================================
// IMAGE UPLOAD
// ============================================
function initImageUpload() {
  setupUploadArea('front-image-upload', 'front-image-input', 'front-image-preview', 'Frontal', (blob) => { frontImageBlob = blob; });
  setupUploadArea('back-image-upload', 'back-image-input', 'back-image-preview', 'Trasera', (blob) => { backImageBlob = blob; });
}

function setupUploadArea(areaId, inputId, previewId, label, onFile) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  area.addEventListener('click', () => input.click());
  
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('dragover');
  });

  area.addEventListener('dragleave', () => {
    area.classList.remove('dragover');
  });

  area.addEventListener('drop', async (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const blob = await fileToBlob(file);
      onFile(blob);
      showImagePreview(previewId, blob, label);
    }
  });

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const blob = await fileToBlob(file);
      onFile(blob);
      showImagePreview(previewId, blob, label);
    }
  });
}

async function showImagePreview(containerId, blob, label) {
  const container = document.getElementById(containerId);
  const url = await blobToDataURL(blob);
  container.innerHTML = `
    <div class="image-preview">
      <img src="${url}" alt="${label}">
      <span class="image-preview-label">${label}</span>
      <button type="button" class="image-preview-remove" data-preview="${containerId}">✕</button>
    </div>
  `;

  container.querySelector('.image-preview-remove').addEventListener('click', () => {
    container.innerHTML = '';
    if (containerId.includes('front')) frontImageBlob = null;
    if (containerId.includes('back')) backImageBlob = null;
  });
}

// ============================================
// SIZE & COLOR TOGGLES
// ============================================
function initSizeToggles() {
  document.getElementById('sizes-grid').addEventListener('click', (e) => {
    const toggle = e.target.closest('.size-toggle');
    if (!toggle) return;
    
    const size = toggle.dataset.size;
    toggle.classList.toggle('selected');
    
    if (selectedSizes.includes(size)) {
      selectedSizes = selectedSizes.filter(s => s !== size);
    } else {
      selectedSizes.push(size);
    }
  });
}

function initColorToggles() {
  const grid = document.getElementById('colors-grid');
  
  grid.addEventListener('click', (e) => {
    const toggle = e.target.closest('.color-toggle');
    if (!toggle) return;
    
    const color = toggle.dataset.color;
    toggle.classList.toggle('selected');
    
    if (selectedColors.includes(color)) {
      selectedColors = selectedColors.filter(c => c !== color);
    } else {
      selectedColors.push(color);
    }
  });

  // Add custom color
  document.getElementById('add-custom-color').addEventListener('click', () => {
    const colorInput = document.getElementById('custom-color');
    const color = colorInput.value;
    
    // Check if already exists
    if (grid.querySelector(`[data-color="${color}"]`)) {
      showToast('Ese color ya existe', 'info');
      return;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'color-toggle selected';
    btn.dataset.color = color;
    btn.style.background = color;
    btn.title = color;
    
    // Insert before custom color input area
    const customArea = grid.querySelector('.form-group');
    grid.insertBefore(btn, customArea);
    
    selectedColors.push(color);
  });
}

// ============================================
// SEARCH
// ============================================
function initSearch() {
  const searchInput = document.getElementById('product-search');
  let debounceTimer;
  
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadProductsTable(searchInput.value.trim());
    }, 300);
  });
}

// ============================================
// CONFIRM MODAL
// ============================================
function initConfirmModal() {
  const overlay = document.getElementById('confirm-overlay');
  
  document.getElementById('confirm-cancel').addEventListener('click', () => {
    overlay.classList.remove('active');
    deleteTargetId = null;
  });

  document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (deleteTargetId !== null) {
      try {
        if (deleteTargetType === 'user') {
          await deleteUser(deleteTargetId);
          showToast('Usuario eliminado', 'success');
          await loadUsersTable();
        } else {
          await deleteProduct(deleteTargetId);
          showToast('Producto eliminado', 'success');
          await loadDashboard();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
    overlay.classList.remove('active');
    deleteTargetId = null;
    deleteTargetType = null;
  });
}

// ============================================
// LOGOUT
// ============================================
function initLogout() {
  document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
    location.reload();
  });
}

// ============================================
// USER MANAGEMENT (admin only)
// ============================================
function initUserManagement() {
  if (currentSession?.role !== 'admin') return;

  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    const card = document.getElementById('add-user-form-card');
    card.style.display = card.style.display === 'none' ? '' : 'none';
  });

  document.getElementById('cancel-user-btn')?.addEventListener('click', () => {
    document.getElementById('add-user-form-card').style.display = 'none';
    document.getElementById('user-form').reset();
  });

  document.getElementById('user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value.trim();
    const displayName = document.getElementById('new-displayname').value.trim();
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (!username || !password || !displayName) {
      showToast('Completa todos los campos', 'error');
      return;
    }

    try {
      await addUser({ username, password, role, displayName });
      showToast(`Usuario "${displayName}" creado ✨`, 'success');
      document.getElementById('user-form').reset();
      document.getElementById('add-user-form-card').style.display = 'none';
      await loadUsersTable();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });
}

async function loadUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  
  const users = await getAllUsers();
  let html = '';

  users.forEach(u => {
    const roleClass = u.role === 'admin' ? 'role-admin' : 'role-worker';
    const roleLabel = u.role === 'admin' ? 'Administrador' : 'Trabajador';

    html += `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td>${u.displayName}</td>
        <td><span class="admin-user-badge ${roleClass}">${roleLabel}</span></td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn delete" data-delete-user-id="${u.id}" title="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Delete user handlers
  tbody.querySelectorAll('[data-delete-user-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteTargetId = parseInt(btn.dataset.deleteUserId);
      deleteTargetType = 'user';
      const overlay = document.getElementById('confirm-overlay');
      overlay.querySelector('.confirm-title').textContent = '¿Eliminar usuario?';
      overlay.querySelector('.confirm-text').textContent = 'El usuario será eliminado permanentemente.';
      overlay.classList.add('active');
    });
  });
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// START
// ============================================
document.addEventListener('DOMContentLoaded', init);
