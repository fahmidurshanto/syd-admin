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

  async getRoutes() {
    const res = await fetch(`${API_BASE}/routes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  }
};
