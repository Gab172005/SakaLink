// src/services/api.js
// Central API layer — all fetch calls go through here.

// 1. Get the raw value from environment or fallback
const rawBaseUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || 'http://localhost:5000';

// 2. FIX: Automatically strip trailing slashes if they exist
const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

// ── Token helpers ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("sakalink_token");
export const getUserType = () => localStorage.getItem("sakalink_userType");

export const saveSession = (token, userType) => {
  localStorage.setItem("sakalink_token", token);
  localStorage.setItem("sakalink_userType", userType);
};

export const clearSession = () => {
  localStorage.removeItem("sakalink_token");
  localStorage.removeItem("sakalink_userType");
};

async function request(path, options = {}) {  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // FIX: Explicitly added the '/api' prefix so your endpoints cleanly map to your Express routes
  const res = await fetch(`${BASE_URL}/api${path}`, { 
    ...options, 
    headers,
    credentials: "include" // get the cookie
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (firstName, lastName, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    }),

  getProfile: () =>
    request("/auth/profile", {
      method: "GET",
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  updateProfile: ({ firstName, lastName }) =>
    request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ firstName, lastName }),
    }),

  getCart: () =>
    request("/auth/cart", {
      method: "GET",
    }),

  syncCart: (cart) =>
    request("/auth/cart", {
      method: "POST",
      body: JSON.stringify({ cart }),
    }),
};

// ── Products ───────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => request(`/products/${id}`),
};

// ── Orders ─────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getMyOrders: () => request("/orders/my-orders"),

  confirmOrder: (id) => request(`/orders/${id}/confirm`, { method: "PATCH" }),

  deliverOrder: (id) => request(`/orders/${id}/deliver`, { method: "PATCH" }),

  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: "PATCH" }),

  create: (orderData) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  getById: (id) => request(`/orders/${id}`),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => request("/admin/users"),

  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),

  getAllOrders: () => request("/admin/orders"),

  getSales: (period = "monthly") => request(`/admin/sales?period=${period}`),

  createProduct: (productData) =>
    request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, { method: "DELETE" }),
};

// ── Notifications ──────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => request("/notifications"),

  getUnreadCount: () => request("/notifications/unread-count", { method: "GET" }),
   
  markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
   
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
};