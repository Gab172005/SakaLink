// src/services/api.js
// Central API layer — all fetch calls go through here.
// Base URL reads from Vite env var; falls back to localhost for dev.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

  const res = await fetch(`${BASE_URL}${path}`, { 
    ...options, 
    headers,
    credentials: "include"//get the cookie
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
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

  // PATCH /api/auth/profile
  // FIX: accepts a { firstName, lastName } object, matching the call in EditProfileForm
  updateProfile: ({ firstName, lastName} ) =>
    request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ firstName, lastName}),
    }),
};

// ── Products ───────────────────────────────────────────────────────────────
export const productsAPI = {
  /**
   * GET /api/products
   * Optional query params: sortBy, order, type, search
   * Returns: Product[]
   */
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },

  /**
   * GET /api/products/:id
   * Returns: Product
   */
  getById: (id) => request(`/products/${id}`),
};

// ── Orders ─────────────────────────────────────────────────────────────────
export const ordersAPI = {
  /**
   * GET /api/orders  (requires auth)
   * Returns: Order[]
   */
  getMyOrders: () => request("/orders/my-orders"),

  /**
   * POST /api/orders  (requires auth)
   * Body: { items: [{ productId, quantity }], ... }
   * Returns: Order
   */
  create: (orderData) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  /**
   * GET /api/orders/:id  (requires auth)
   * Returns: Order
   */
  getById: (id) => request(`/orders/${id}`),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  /**
   * GET /api/admin/users  (requires admin)
   * Returns: User[]
   */
  getUsers: () => request("/admin/users"),

  /**
   * GET /api/admin/orders  (requires admin)
   * Returns: Order[]
   */
  getAllOrders: () => request("/admin/orders"),

  /**
   * POST /api/admin/products  (requires admin)
   * Body: product fields
   * Returns: Product
   */
  createProduct: (productData) =>
    request("/admin/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  /**
   * PUT /api/admin/products/:id  (requires admin)
   */
  updateProduct: (id, productData) =>
    request(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  /**
   * DELETE /api/admin/products/:id  (requires admin)
   */
  deleteProduct: (id) =>
    request(`/admin/products/${id}`, { method: "DELETE" }),
};
