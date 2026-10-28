const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
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

  async updateBookingStatus(refOrId, status) {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async cancelBooking(refOrId, reason = 'Cancelled by administrator') {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  },

  async deleteBooking(refOrId) {
    const res = await fetch(`${API_BASE}/bookings/${refOrId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete booking');
    return res.json();
  },

  async getRoutes() {
    const res = await fetch(`${API_BASE}/routes`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  }
};
