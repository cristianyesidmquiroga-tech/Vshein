/* ============================================
   SHEIN VÉLEZ — Database Layer (IndexedDB + Dexie)
   Optimized: URLs instead of Blobs for images
   ============================================ */

import Dexie from 'dexie';

// Initialize database — version 2: URL-based images
const db = new Dexie('SheinVelezDB');

// Version 1 kept for migration compatibility
db.version(1).stores({
  products: '++id, name, category, createdAt',
  users: '++id, username, role'
});

// Version 2: same schema but we'll store imageURL strings instead of blobs
db.version(2).stores({
  products: '++id, name, category, createdAt',
  users: '++id, username, role'
}).upgrade(async tx => {
  // Migrate any blob-based products to URL-based
  // Old products with blob images get converted to placeholder URLs
  await tx.table('products').toCollection().modify(product => {
    // If frontImage is a Blob, replace with a placeholder URL
    if (product.frontImage instanceof Blob) {
      product.frontImageURL = null; // Will use placeholder
      delete product.frontImage;
    }
    if (product.backImage instanceof Blob) {
      product.backImageURL = null;
      delete product.backImage;
    }
    // If already has URLs, keep them
    if (!product.frontImageURL && !product.frontImage) {
      product.frontImageURL = null;
    }
    if (!product.backImageURL && !product.backImage) {
      product.backImageURL = null;
    }
  });
});

// ============================================
// SEED: Default admin & worker users
// ============================================
async function seedUsers() {
  const count = await db.users.count();
  if (count === 0) {
    await db.users.bulkAdd([
      {
        username: 'admin_sv',
        passwordHash: await hashPassword('SheinVelez$2026!'),
        role: 'admin',
        displayName: 'Administrador',
        createdAt: new Date()
      },
      {
        username: 'trabajador_sv',
        passwordHash: await hashPassword('SheinWork$2026!'),
        role: 'worker',
        displayName: 'Trabajador',
        createdAt: new Date()
      }
    ]);
  }
}

// Simple password hashing (SHA-256 via Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_sheinvelez_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// AUTH
// ============================================
export async function authenticateUser(username, password) {
  await seedUsers();
  const hash = await hashPassword(password);
  const user = await db.users.where('username').equals(username).first();
  if (user && user.passwordHash === hash) {
    const session = { id: user.id, username: user.username, role: user.role, displayName: user.displayName };
    sessionStorage.setItem('sv_session', JSON.stringify(session));
    return session;
  }
  return null;
}

export function getCurrentSession() {
  const data = sessionStorage.getItem('sv_session');
  return data ? JSON.parse(data) : null;
}

export function logout() {
  sessionStorage.removeItem('sv_session');
}

// ============================================
// PRODUCTS CRUD — URL-based images
// ============================================

/**
 * Add a product. Images are stored as URLs (strings), NOT blobs.
 * productData: {
 *   name, category, description,
 *   frontImageURL (string URL),
 *   backImageURL (string URL | null),
 *   variants: [{ size, color, inStock }],
 *   isNew (boolean)
 * }
 */
export async function addProduct(productData) {
  const product = {
    name: productData.name,
    category: productData.category,
    description: productData.description || '',
    frontImageURL: productData.frontImageURL || null,
    backImageURL: productData.backImageURL || null,
    variants: productData.variants || [],
    isNew: productData.isNew || false,
    createdAt: new Date()
  };
  const id = await db.products.add(product);
  return id;
}

export async function updateProduct(id, updates) {
  // Clean up: if someone passes blob images, convert to null
  if (updates.frontImage instanceof Blob) {
    delete updates.frontImage;
  }
  if (updates.backImage instanceof Blob) {
    delete updates.backImage;
  }
  await db.products.update(id, updates);
}

export async function deleteProduct(id) {
  await db.products.delete(id);
}

export async function getProduct(id) {
  return await db.products.get(id);
}

export async function getAllProducts() {
  return await db.products.orderBy('createdAt').reverse().toArray();
}

export async function getProductsByCategory(category) {
  if (!category || category === 'todos') {
    return getAllProducts();
  }
  return await db.products.where('category').equals(category).reverse().sortBy('createdAt');
}

export async function getProductCount() {
  return await db.products.count();
}

export async function getProductStats() {
  const products = await getAllProducts();
  const total = products.length;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  const categories = new Set();

  products.forEach(p => {
    categories.add(p.category);
    const hasStock = p.variants && p.variants.some(v => v.inStock);
    const allOut = p.variants && p.variants.every(v => !v.inStock);
    const fewInStock = p.variants && p.variants.filter(v => v.inStock).length <= 2 && !allOut;

    if (allOut) outOfStock++;
    else if (fewInStock) lowStock++;
    else inStock++;
  });

  return { total, inStock, lowStock, outOfStock, categoriesCount: categories.size };
}

// ============================================
// USERS CRUD (admin only)
// ============================================
export async function getAllUsers() {
  return await db.users.toArray();
}

export async function addUser(userData) {
  const hash = await hashPassword(userData.password);
  return await db.users.add({
    username: userData.username,
    passwordHash: hash,
    role: userData.role,
    displayName: userData.displayName,
    createdAt: new Date()
  });
}

export async function deleteUser(id) {
  const admins = await db.users.where('role').equals('admin').count();
  const user = await db.users.get(id);
  if (user.role === 'admin' && admins <= 1) {
    throw new Error('No puedes eliminar el último administrador');
  }
  await db.users.delete(id);
}

// ============================================
// IMAGE HELPERS — Now URL-based (much lighter)
// ============================================

/**
 * Get image URL from a product field.
 * Supports both old blob format (migrated) and new URL format.
 * Returns a usable image source string.
 */
export function getImageURL(imageField) {
  if (!imageField) return null;
  // If it's already a URL string, return directly
  if (typeof imageField === 'string') return imageField;
  // Legacy: if somehow a blob got in, convert it
  if (imageField instanceof Blob) {
    return URL.createObjectURL(imageField);
  }
  return null;
}

// Legacy compatibility — wraps getImageURL in a promise
export function blobToDataURL(imageField) {
  return Promise.resolve(getImageURL(imageField));
}

export function fileToBlob(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result], { type: file.type });
      resolve(blob);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Clear old database to reset with URL-based products.
 * Call this once to migrate from blob-heavy DB.
 */
export async function resetProductsDB() {
  await db.products.clear();
}

// Init seed on import
seedUsers();

export default db;
