const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Common fetch wrapper using HttpOnly cookies (credentials: 'include')
 */
async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include", // Automatically sends accessToken and refreshToken cookies
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`,
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /* ==========================================================================
     AUTH ENDPOINTS (/api/admin) - Cookie-based
     ========================================================================== */
  async login(credentials) {
    return request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return request("/admin/logout", {
      method: "POST",
    });
  },

  async refreshToken() {
    return request("/admin/refresh", {
      method: "POST",
    });
  },

  async getMe() {
    return request("/admin/me");
  },

  /* ==========================================================================
     ADMIN USERS MANAGEMENT (/api/admin/admins) - Superadmin only
     ========================================================================== */
  async getAdmins(params = {}) {
    const query = new URLSearchParams();
    if (params.role && params.role !== "all") query.set("role", params.role);
    if (params.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/admins${qs}`);
  },

  async getAdmin(id) {
    return request(`/admin/admins/${id}`);
  },

  async createAdmin(payload) {
    return request("/admin/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAdmin(id, payload) {
    return request(`/admin/admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async setAdminPassword(id, password) {
    return request(`/admin/admins/${id}/set-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },

  async deleteAdmin(id) {
    return request(`/admin/admins/${id}`, {
      method: "DELETE",
    });
  },

  /* ==========================================================================
     BOOKINGS MANAGEMENT (/api/admin/bookings)
     ========================================================================== */
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all")
      query.set("status", params.status);
    if (params.vehicleType && params.vehicleType !== "all")
      query.set("vehicleType", params.vehicleType);
    if (params.bookingNumber) query.set("bookingNumber", params.bookingNumber);
    if (params.phone) query.set("phone", params.phone);
    if (params.limit) query.set("limit", params.limit);
    if (params.skip) query.set("skip", params.skip);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/bookings${qs}`);
  },

  async getBooking(refOrId) {
    return request(`/admin/bookings/${refOrId}`);
  },

  async updateBookingDetails(refOrId, payload) {
    return request(`/admin/bookings/${refOrId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async updateBooking(refOrId, payload) {
    return request(`/admin/bookings/${refOrId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateBookingStatus(refOrId, status) {
    return this.updateBookingDetails(refOrId, { status });
  },

  async cancelBooking(refOrId, reason = "Cancelled by administrator") {
    return request(`/admin/bookings/${refOrId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async deleteBooking(refOrId) {
    return request(`/admin/bookings/${refOrId}`, {
      method: "DELETE",
    });
  },

  /* ==========================================================================
     PAYMENTS MANAGEMENT (/api/admin/payments)
     ========================================================================== */
  async getPayments(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all")
      query.set("status", params.status);
    if (params.bookingNumber) query.set("bookingNumber", params.bookingNumber);
    if (params.limit) query.set("limit", params.limit);
    if (params.skip) query.set("skip", params.skip);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/payments${qs}`);
  },

  async getBookingPaymentStatus(refOrId) {
    return request(`/admin/payments/booking/${refOrId}`);
  },

  /* ==========================================================================
     ROUTES & FARES MANAGEMENT (/api/admin/routes)
     ========================================================================== */
  async getRoutes(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.isActive !== undefined && params.isActive !== "all")
      query.set("isActive", params.isActive);
    if (params.limit) query.set("limit", params.limit);
    if (params.skip) query.set("skip", params.skip);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/routes${qs}`);
  },

  async getRoute(id) {
    return request(`/admin/routes/${id}`);
  },

  async getRouteById(id) {
    return request(`/admin/routes/${id}`);
  },

  async createRoute(payload) {
    return request("/admin/routes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateRoute(id, payload) {
    return request(`/admin/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteRoute(id) {
    return request(`/admin/routes/${id}`, {
      method: "DELETE",
    });
  },

  async getUniquePlaces() {
    return request("/routes/all");
  },
};
