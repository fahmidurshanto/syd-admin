'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  User,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';

export default function PaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modals
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBookings({ limit: 100 });
      if (res.success) {
        setBookings(res.bookings || []);
        setTotalCount(res.total || (res.bookings ? res.bookings.length : 0));
      }
    } catch (err) {
      console.error(err);
      setError('Could not load payment records from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  // Compute Overall Financial Analytics
  const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid');
  const pendingPayments = bookings.filter((b) => b.paymentStatus === 'pending');
  const refundedPayments = bookings.filter((b) => b.paymentStatus === 'refunded');

  const totalCollectedAUD = paidBookings.reduce((sum, b) => {
    const val = typeof b.fare === 'object' ? Number(b.fare?.total || 0) : Number(b.fare || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const pendingAmountAUD = pendingPayments.reduce((sum, b) => {
    const val = typeof b.fare === 'object' ? Number(b.fare?.total || 0) : Number(b.fare || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Filtered List
  const filteredPayments = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const intentId = b.paymentDetails?.paymentIntentId?.toLowerCase() || '';
    const matchesSearch = !term ||
      b.bookingNumber?.toLowerCase().includes(term) ||
      b.passengerName?.toLowerCase().includes(term) ||
      intentId.includes(term);

    const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredPayments.length / limit) || 1;
  const paginatedList = filteredPayments.slice((page - 1) * limit, page * limit);

  // Pagination helper with smart ellipsis
  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
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
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Payments & Transactions
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Monitor real Stripe payments, transaction IDs, checkout receipts, and settlement amounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPaymentsData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Paid Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Settled (Stripe)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              ${totalCollectedAUD.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">AUD</span>
          </div>
          <div className="mt-3 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {paidBookings.length} completed transactions
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Unpaid</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">
              ${pendingAmountAUD.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-medium">AUD</span>
          </div>
          <div className="mt-3 text-xs text-amber-700 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {pendingPayments.length} pending bookings awaiting checkout
          </div>
        </div>

        {/* Stripe Security & Gateway */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Status</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">Stripe Payments</span>
          </div>
          <div className="mt-3 text-xs text-indigo-700 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Webhook & Intent verification live
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Booking Ref, Passenger, Stripe Intent ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Payment Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
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
          Showing <span className="font-bold text-slate-800">{paginatedList.length}</span> of {filteredPayments.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Stripe Intent / ID</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-500">
                    <p className="font-semibold text-slate-800 text-base">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search keyword or filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((b) => {
                  const fareTotal = typeof b.fare === 'object' ? b.fare?.total : b.fare;
                  const paymentDetails = b.paymentDetails || {};
                  const dateStr = paymentDetails.paidAt || b.createdAt;
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleString('en-AU', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }) : 'N/A';

                  return (
                    <tr key={b.bookingNumber || b._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-mono font-bold text-indigo-600">
                        {b.bookingNumber}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{b.passengerName}</div>
                        <div className="text-xs text-slate-400">{b.passengerEmail}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-600 max-w-[180px]">
                        <span className="truncate block" title={paymentDetails.paymentIntentId || 'No intent created'}>
                          {paymentDetails.paymentIntentId || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold uppercase text-slate-700">
                        {paymentDetails.paymentMethod || 'Card / Stripe'}
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900">
                        ${fareTotal || '0'} AUD
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getPaymentBadge(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(b)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition cursor-pointer"
                          title="View Payment Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Centered Numbered Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium order-2 sm:order-1">
              Showing page <strong className="text-slate-800 font-bold">{page}</strong> of <strong className="text-slate-800 font-bold">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5 order-1 sm:order-2 sm:mx-auto">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPaginationPages().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 font-bold text-xs select-none">
                      ...
                    </span>
                  );
                }
                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden sm:block w-36 order-3" />
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">Payment Breakdown</span>
                <h3 className="text-xl font-black text-slate-900">{selectedPayment.bookingNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase block">Amount Paid</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    ${typeof selectedPayment.fare === 'object' ? selectedPayment.fare?.total : selectedPayment.fare} AUD
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getPaymentBadge(selectedPayment.paymentStatus)}`}>
                  {selectedPayment.paymentStatus}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedPayment.passengerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="text-slate-800">{selectedPayment.passengerEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Payment Gateway:</span>
                  <span className="font-semibold text-indigo-700">Stripe Elements (Card)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Stripe Payment Intent:</span>
                  <span className="font-mono text-[11px] text-slate-700">{selectedPayment.paymentDetails?.paymentIntentId || 'None'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Recorded Date:</span>
                  <span className="text-slate-800">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
