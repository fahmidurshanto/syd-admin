'use client';

import { useEffect, useState } from 'react';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Car,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Luggage,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Cancelled by admin/dispatcher');
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null);
  const [notesEdit, setNotesEdit] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        vehicleType: vehicleFilter !== 'all' ? vehicleFilter : undefined,
        limit: 100,
      });
      if (res.success) {
        setBookings(res.bookings || []);
        setTotalCount(res.total || (res.bookings ? res.bookings.length : 0));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, vehicleFilter]);

  // Client-side quick search filtering
  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch = !term || 
      b.bookingNumber?.toLowerCase().includes(term) ||
      b.passengerName?.toLowerCase().includes(term) ||
      b.passengerPhone?.includes(term) ||
      b.passengerEmail?.toLowerCase().includes(term);

    const matchesPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const handleStatusChange = async (refOrId, newStatus) => {
    try {
      setActionLoading(true);
      await api.updateBookingStatus(refOrId, newStatus);
      await fetchBookings();
      if (selectedBooking && (selectedBooking.bookingNumber === refOrId || selectedBooking._id === refOrId)) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert('Error updating status: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      await api.updateBookingDetails(selectedBooking.bookingNumber, { notes: notesEdit });
      setSelectedBooking(prev => ({ ...prev, notes: notesEdit }));
      await fetchBookings();
      alert('Notes saved successfully');
    } catch (e) {
      alert('Failed to update notes: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setActionLoading(true);
      await api.cancelBooking(cancelModalBooking.bookingNumber, cancelReason);
      setCancelModalBooking(null);
      await fetchBookings();
      if (selectedBooking && selectedBooking.bookingNumber === cancelModalBooking.bookingNumber) {
        setSelectedBooking(null);
      }
    } catch (e) {
      alert('Failed to cancel: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteConfirmBooking) return;
    try {
      setActionLoading(true);
      await api.deleteBooking(deleteConfirmBooking.bookingNumber || deleteConfirmBooking._id);
      setDeleteConfirmBooking(null);
      await fetchBookings();
      if (selectedBooking && (selectedBooking.bookingNumber === deleteConfirmBooking.bookingNumber || selectedBooking._id === deleteConfirmBooking._id)) {
        setSelectedBooking(null);
      }
    } catch (e) {
      alert('Failed to delete booking: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setNotesEdit(booking.notes || '');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'in_progress':
      case 'assigned':
      case 'on_the_way':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            Bookings Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Search, update rides, manage dispatch status, passenger details and cancellations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Vehicle:</span>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Vehicles</option>
              <option value="Chauffeur">Chauffeur</option>
              <option value="Taxi">Taxi</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Van">Van</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredBookings.length}</span> of {totalCount}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Passenger Details</th>
                <th className="py-3.5 px-4">Pickup & Dropoff</th>
                <th className="py-3.5 px-4">Pickup Time</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Fare</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Ride Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto text-center">
                      <p className="font-semibold text-slate-800 text-base">No bookings found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria or search keyword.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const fareTotal = typeof b.fare === 'object' ? b.fare?.total : b.fare;
                  const pickupName = typeof b.pickup === 'object' ? b.pickup?.name || b.pickup?.address || 'Pickup' : b.pickup;
                  const dropoffName = typeof b.dropoff === 'object' ? b.dropoff?.name || b.dropoff?.address || 'Dropoff' : b.dropoff;
                  const formattedTime = b.pickupTime ? new Date(b.pickupTime).toLocaleString('en-AU', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }) : 'Now / ASAP';

                  return (
                    <tr key={b.bookingNumber || b._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-mono font-bold text-indigo-600">
                        {b.bookingNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">{b.passengerName}</p>
                          <p className="text-xs text-slate-500">{b.passengerPhone}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{b.passengerEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="truncate text-xs text-slate-800 font-medium">
                          <span className="text-slate-400 font-normal">From:</span> {pickupName}
                        </div>
                        {dropoffName && (
                          <div className="truncate text-xs text-slate-600 mt-0.5">
                            <span className="text-slate-400 font-normal">To:</span> {dropoffName}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {formattedTime}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 uppercase inline-block">
                            {b.vehicleType}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span title="Passengers">👤 {b.passengers || 1} pax</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5 text-slate-600" title="Luggage">
                              <Luggage className="w-3 h-3 text-indigo-500" /> {b.luggage !== undefined ? b.luggage : (b.notes?.match(/Luggage:\s*(\d+)/i)?.[1] || 0)} bags
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ${fareTotal || '0'} AUD
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getPaymentBadge(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetails(b)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition cursor-pointer"
                            title="View & Edit Booking"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => setCancelModalBooking(b)}
                              className="p-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-200 text-amber-700 shadow-xs transition cursor-pointer"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmBooking(b)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 shadow-xs transition cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details / Dispatch Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">Booking Management</span>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {selectedBooking.bookingNumber}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${getStatusBadge(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Update Dispatch Status</span>
              <div className="flex flex-wrap items-center gap-2">
                {['pending', 'confirmed', 'assigned', 'on_the_way', 'arrived', 'in_progress', 'completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedBooking.bookingNumber, st)}
                    disabled={actionLoading || selectedBooking.status === st}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer disabled:opacity-40 ${
                      selectedBooking.status === st
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Passenger Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Passenger Details
                </span>
                <p className="font-bold text-slate-900 text-base">{selectedBooking.passengerName}</p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedBooking.passengerPhone}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedBooking.passengerEmail}
                </p>
              </div>

              {/* Ride & Vehicle Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-600" /> Vehicle & Capacity
                </span>
                <p className="font-bold text-indigo-700 text-base capitalize">{selectedBooking.vehicleType}</p>
                <div className="flex items-center gap-4 text-xs text-slate-700 pt-0.5">
                  <p>Passengers: <strong className="text-slate-900 font-bold">{selectedBooking.passengers || 1}</strong></p>
                  <span>•</span>
                  <p className="flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                    Luggage: <strong className="text-slate-900 font-bold">{selectedBooking.luggage !== undefined ? selectedBooking.luggage : (selectedBooking.notes?.match(/Luggage:\s*(\d+)/i)?.[1] || 0)} bags</strong>
                  </p>
                </div>
                <p className="text-xs text-slate-600">Pickup Date/Time: <strong className="text-slate-800">{new Date(selectedBooking.pickupTime).toLocaleString()}</strong></p>
              </div>

              {/* Locations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Route & Destinations
                </span>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-700"><strong className="text-slate-900">Pickup:</strong> {typeof selectedBooking.pickup === 'object' ? selectedBooking.pickup.name || selectedBooking.pickup.address : selectedBooking.pickup}</p>
                  <p className="text-slate-700"><strong className="text-slate-900">Dropoff:</strong> {typeof selectedBooking.dropoff === 'object' ? selectedBooking.dropoff.name || selectedBooking.dropoff.address : selectedBooking.dropoff || 'Not specified'}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payment & Billing
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Fare</span>
                    <strong className="text-sm font-bold text-slate-900">
                      ${typeof selectedBooking.fare === 'object' ? selectedBooking.fare?.total : selectedBooking.fare} AUD
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Status</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${getPaymentBadge(selectedBooking.paymentStatus)}`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Method</span>
                    <span className="font-semibold text-slate-700 capitalize">{selectedBooking.paymentDetails?.paymentMethod || 'Stripe / Card'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Stripe Intent</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate block max-w-[130px]">{selectedBooking.paymentDetails?.paymentIntentId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Notes / Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Internal Notes / Driver Instructions
              </label>
              <textarea
                rows={2}
                value={notesEdit}
                onChange={(e) => setNotesEdit(e.target.value)}
                placeholder="Add special instructions, luggage details, or dispatcher remarks..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Cancel Booking</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking <strong className="text-slate-900">{cancelModalBooking.bookingNumber}</strong> for {cancelModalBooking.passengerName}?
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Cancellation Reason:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Permanently Delete Booking</h3>
            </div>
            <p className="text-xs text-slate-600">
              This will permanently delete booking <strong className="text-slate-900">{deleteConfirmBooking.bookingNumber}</strong> from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmBooking(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleDeleteBooking}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
