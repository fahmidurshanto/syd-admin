const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Bookings
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.vehicleType && params.vehicleType !== 'all') query.set('vehicleType', params.vehicleType);
    if (params.bookingNumber) query.set('bookingNumber', params.bookingNumber);
    if (params.phone) query.set('phone', params.phone);
    if (params.limit) query.set('limit', params.limit);
    if (params.skip) query.set('skip', params.skip);

    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async getBooking(refOrId) {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch booking details');
    return res.json();
  },

  async updateBookingDetails(refOrId, payload) {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to update booking');
    }
    return res.json();
  },

  async updateBookingStatus(refOrId, status) {
    return this.updateBookingDetails(refOrId, { status });
  },

  async cancelBooking(refOrId, reason = 'Cancelled by administrator') {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to cancel booking');
    }
    return res.json();
  },

  async deleteBooking(refOrId) {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete booking');
    }
    return res.json();
  },

  // Routes & Fares
  async getRoutes(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.firstPlace) query.set('firstPlace', params.firstPlace);
    if (params.lastPlace) query.set('lastPlace', params.lastPlace);
    if (params.isActive !== undefined && params.isActive !== 'all') query.set('isActive', params.isActive);
    if (params.limit) query.set('limit', params.limit);
    if (params.skip) query.set('skip', params.skip);

    const res = await fetch(`${API_BASE}/routes?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },

  async getRouteById(id) {
    const res = await fetch(`${API_BASE}/routes/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch route');
    return res.json();
  },

  async createRoute(payload) {
    const res = await fetch(`${API_BASE}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to create route');
    }
    return res.json();
  },

  async updateRoute(id, payload) {
    const res = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to update route');
    }
    return res.json();
  },

  async deleteRoute(id) {
    const res = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete route');
    }
    return res.json();
  },

  async getUniquePlaces() {
    const res = await fetch(`${API_BASE}/routes/all`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch places');
    return res.json();
  },

  // Payments
  async getPaymentStatus(refOrId) {
    const res = await fetch(`${API_BASE}/payments/booking/${refOrId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch payment status');
    return res.json();
  }
};
