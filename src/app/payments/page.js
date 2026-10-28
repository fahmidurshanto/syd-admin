"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  DollarSign,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchRef, setSearchRef] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Details Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [bookingPaymentDetail, setBookingPaymentDetail] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchRef.trim()) params.bookingNumber = searchRef.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.getPayments(params);
      if (res.success) {
        setPayments(res.payments || []);
        setTotalCount(res.total || (res.payments ? res.payments.length : 0));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch payments from backend.");
    } finally {
      setLoading(false);
    }
  }, [searchRef, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const viewPaymentDetails = async (payment) => {
    setSelectedPayment(payment);
    setBookingPaymentDetail(null);
    if (payment.bookingNumber) {
      try {
        setFetchingDetail(true);
        const res = await api.getBookingPaymentStatus(payment.bookingNumber);
        if (res.success && res.data) {
          setBookingPaymentDetail(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch booking payment detail:", err);
      } finally {
        setFetchingDetail(false);
      }
    }
  };

  // Metrics
  const totalVolume = payments.reduce((acc, p) => {
    if (p.status === "succeeded") {
      return acc + (Number(p.amount) || 0);
    }
    return acc;
  }, 0);

  const succeededCount = payments.filter(
    (p) => p.status === "succeeded",
  ).length;
  const pendingCount = payments.filter((p) =>
    [
      "requires_payment_method",
      "requires_action",
      "requires_confirmation",
      "processing",
    ].includes(p.status),
  ).length;
  const failedCount = payments.filter((p) =>
    ["failed", "canceled"].includes(p.status),
  ).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "succeeded":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "processing":
      case "requires_action":
      case "requires_confirmation":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "requires_payment_method":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "failed":
      case "canceled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Payments Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor Stripe transactions, checkout sessions, and customer payment
            statuses.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settled Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            ${totalVolume.toFixed(2)} AUD
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total from successful transactions
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Succeeded
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {succeededCount}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Paid in full
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending / Processing
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {pendingCount}
          </p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            Awaiting customer or intent
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Failed / Canceled
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {failedCount}
          </p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            Declined or expired sessions
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Search by Booking # (e.g. SYD-2026-XXXX)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-medium text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="requires_payment_method">
              Requires Payment Method
            </option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Error notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Booking Number</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Stripe Intent ID</th>
                <th className="py-3 px-4">Customer Email</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading payments from backend...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  return (
                    <tr
                      key={p._id || p.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {p.bookingNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ${Number(p.amount).toFixed(2)} {p.currency || "AUD"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(p.status)}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                        {p.stripePaymentIntentId || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">
                        {p.customerEmail || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => viewPaymentDetails(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-indigo-600 hover:text-indigo-800 font-medium text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Payment Details */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Payment Record: {selectedPayment.bookingNumber}
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedPayment.status)}`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount & Currency</span>
                  <span className="font-bold text-slate-900">
                    ${Number(selectedPayment.amount).toFixed(2)}{" "}
                    {selectedPayment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stripe Intent ID</span>
                  <span className="font-mono text-slate-700">
                    {selectedPayment.stripePaymentIntentId}
                  </span>
                </div>
                {selectedPayment.stripeCheckoutSessionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Checkout Session</span>
                    <span className="font-mono text-slate-700">
                      {selectedPayment.stripeCheckoutSessionId}
                    </span>
                  </div>
                )}
                {selectedPayment.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Email</span>
                    <span className="text-slate-800">
                      {selectedPayment.customerEmail}
                    </span>
                  </div>
                )}
                {selectedPayment.receiptUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Stripe Receipt</span>
                    <a
                      href={selectedPayment.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      View Receipt <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Booking Live Status Query */}
              {fetchingDetail ? (
                <div className="text-center py-4 text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-indigo-500" />
                  Fetching linked booking status...
                </div>
              ) : bookingPaymentDetail ? (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                  <p className="font-semibold text-indigo-900 text-xs">
                    Live Booking Sync
                  </p>
                  <p className="text-slate-600">
                    Booking Status:{" "}
                    <b className="text-slate-800">
                      {bookingPaymentDetail.status}
                    </b>
                  </p>
                  <p className="text-slate-600">
                    Fare Total:{" "}
                    <b className="text-slate-800">
                      $
                      {bookingPaymentDetail.fare?.total ||
                        selectedPayment.amount}
                    </b>
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
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
