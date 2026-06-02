const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role');
}

export function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ===== PRODUCTS =====
export const productsApi = {
  getAll: (params?: string) => apiFetch(`/products${params ? '?' + params : ''}`),
  getOne: (id: number) => apiFetch(`/products/${id}`),
  getVariants: (id: number) => apiFetch(`/products/${id}/variants`),
  create: (body: any) => apiFetch('/products', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  update: (id: number, body: any) => apiFetch(`/products/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }),
  delete: (id: number) => apiFetch(`/products/${id}`, { method: 'DELETE', headers: authHeaders() }),
};

// ===== CATEGORIES =====
export const categoriesApi = {
  getAll: () => apiFetch('/categories'),
  create: (body: any) => apiFetch('/categories', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  update: (id: number, body: any) => apiFetch(`/categories/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }),
  delete: (id: number) => apiFetch(`/categories/${id}`, { method: 'DELETE', headers: authHeaders() }),
};

// ===== CART =====
export const cartApi = {
  get: () => apiFetch('/cart', { headers: authHeaders() }),
  addItem: (body: { productId: number; quantity: number; size?: string; color?: string }) =>
    apiFetch('/cart/items', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  updateItem: (id: number, quantity: number) =>
    apiFetch(`/cart/items/${id}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ quantity }) }),
  deleteItem: (id: number) =>
    apiFetch(`/cart/items/${id}`, { method: 'DELETE', headers: authHeaders() }),
};

// ===== ADDRESSES =====
export const addressesApi = {
  getAll: () => apiFetch('/addresses', { headers: authHeaders() }),
  create: (body: any) => apiFetch('/addresses', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  delete: (id: number) => apiFetch(`/addresses/${id}`, { method: 'DELETE', headers: authHeaders() }),
};

// ===== CHAT =====
export const chatApi = {
  getMyMessages: () => apiFetch('/chat/my', { headers: authHeaders() }),
  send: (content: string) => apiFetch('/chat/send', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ content }) }),
  getAllChats: () => apiFetch('/chat/all', { headers: authHeaders() }),
  getUserChat: (userId: number) => apiFetch(`/chat/user/${userId}`, { headers: authHeaders() }),
  reply: (userId: number, content: string) => apiFetch(`/chat/reply/${userId}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ content }) }),
};

// ===== REPORTS =====
export const reportsApi = {
  getSummary: () => apiFetch('/reports/summary', { headers: authHeaders() }),
};

// ===== AUTH =====
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    apiFetch('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) }),
};

// ===== ORDERS =====
export const ordersApi = {
  getMy: () => apiFetch('/orders/my', { headers: authHeaders() }),
  getMyOrders: () => apiFetch('/orders/my', { headers: authHeaders() }),
  getAllOrders: () => apiFetch('/orders', { headers: authHeaders() }),
  
  // Fitur cerdas: Mendukung JSON biasa (COD) dan FormData (QRIS)
  create: (body: any) => {
    if (body instanceof FormData) {
      // Jika data yang dikirim berupa FormData (Kasus QRIS + Bukti Gambar)
      return apiFetch('/orders', {
        method: 'POST',
        headers: {
          // Hanya menyertakan Token, biarkan browser menentukan Content-Type multipart secara otomatis
          Authorization: `Bearer ${getToken()}`,
        },
        body: body, // Kirim objek FormData langsung utuh
      });
    } else {
      // Jika data yang dikirim berupa objek biasa (Kasus COD bawaan awal)
      return apiFetch('/orders', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
    }
  },
};