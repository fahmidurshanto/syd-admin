"use client";

import { AlertCircle, CreditCard, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ScrollableTable from "@/components/ScrollableTable";
import SearchInput from "@/components/SearchInput";
import { useSearchInput } from "@/hooks/useSearchInput";
import { api } from "@/lib/api";
import { paymentsCache } from "@/lib/dataCache";
import PaymentDetailModal from "./components/PaymentDetailModal";

const PAYMENT_COLUMNS = [
  { label: "Booking Number" },
  { label: "Amount" },
  { label: "Payment Status" },
  { label: "Stripe Intent ID" },
  { label: "Customer Email" },
  { label: "Created Date" },
  { label: "Inspect", align: "right" },
];

const getCacheKey = (searchTerm, filter) => {
  const term =
    typeof searchTerm === "string" ? searchTerm.trim().toLowerCase() : "";
  const filt = typeof filter === "string" ? filter : "all";
  return `${term}__${filt}`;
};

export default function PaymentsManagementPage() {
  const [payments, setPayments] = useState(
    () => paymentsCache.get("default") || [],
  );
  const [loading, setLoading] = useState(() => !paymentsCache.has("default"));
  const [error, setError] = useState(null);

  const {
    search: searchRef,
    setSearch: setSearchRef,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  } = useSearchInput();

  const [statusFilter, setStatusFilter] = useState("all");

  // Details Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [bookingPaymentDetail, setBookingPaymentDetail] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const fetchPayments = useCallback(
    async (
      searchTerm = debouncedSearch,
      filter = statusFilter,
      force = false,
    ) => {
      const term =
        typeof searchTerm === "string" ? searchTerm : debouncedSearch;
      const filt = typeof filter === "string" ? filter : statusFilter;
      const shouldForce = force === true || typeof searchTerm !== "string";
      const isDefault = !term?.trim() && filt === "all";
      const cacheKey = isDefault ? "default" : getCacheKey(term, filt);

      if (!shouldForce && paymentsCache.has(cacheKey)) {
        setPayments(paymentsCache.get(cacheKey));
        setLoading(false);
        setIsSearching(false);
        return;
      }

      try {
        if (shouldForce || !paymentsCache.has("default")) {
          setLoading(true);
        }
        setIsSearching(true);
        setError(null);

        const params = { limit: 100 };
        if (term?.trim()) {
          params.bookingNumber = term.trim();
        }
        if (filt !== "all") {
          params.status = filt;
        }

        const res = await api.getPayments(params);
        if (res.success) {
          const list = res.payments || [];
          paymentsCache.set(cacheKey, list);
          if (isDefault) {
            paymentsCache.set("default", list);
          }
          setPayments(list);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch payments from backend.");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearch, statusFilter, setIsSearching],
  );

  // Trigger fetch with race condition protection and cache lookup
  useEffect(() => {
    let isCurrent = true;
    const isDefault = !debouncedSearch?.trim() && statusFilter === "all";
    const cacheKey = isDefault
      ? "default"
      : getCacheKey(debouncedSearch, statusFilter);

    if (paymentsCache.has(cacheKey)) {
      setPayments(paymentsCache.get(cacheKey));
      setLoading(false);
      setIsSearching(false);
      return;
    }

    const performFetch = async () => {
      try {
        if (!paymentsCache.has("default")) {
          setLoading(true);
        }
        setIsSearching(true);
        setError(null);

        const params = { limit: 100 };
        if (debouncedSearch?.trim()) {
          params.bookingNumber = debouncedSearch.trim();
        }
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const res = await api.getPayments(params);
        if (isCurrent && res.success) {
          const list = res.payments || [];
          paymentsCache.set(cacheKey, list);
          if (isDefault) {
            paymentsCache.set("default", list);
          }
          setPayments(list);
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setError(err.message || "Failed to fetch payments from backend.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
          setIsSearching(false);
        }
      }
    };

    performFetch();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, statusFilter, setIsSearching]);

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

  const handleRefresh = useCallback(async () => {
    paymentsCache.clear();
    await fetchPayments(debouncedSearch, statusFilter, true);
  }, [debouncedSearch, statusFilter, fetchPayments]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payments Management"
        description="Monitor Stripe transactions, checkout sessions, and customer payment statuses."
        icon={CreditCard}
        onRefresh={handleRefresh}
        loading={loading}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
              <span className="text-slate-400 font-normal">
                Settled Volume:
              </span>
              <span className="text-emerald-600 font-bold">
                ${totalVolume.toFixed(2)} AUD
              </span>
            </div>
          </div>
        }
      />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={searchRef}
          onChange={setSearchRef}
          onClear={clear}
          isLoading={isSearching}
          placeholder="Search by Booking # (e.g. SYD-2026-XXXX)..."
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isSearching && (
            <span className="text-xs text-indigo-600 font-medium animate-pulse">
              Searching...
            </span>
          )}
          <label
            htmlFor="payment-status-filter"
            className="text-xs font-medium text-slate-500"
          >
            Status:
          </label>
          <select
            id="payment-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

      {/* Scrollable Payments Table */}
      <ScrollableTable
        columns={PAYMENT_COLUMNS}
        loading={loading}
        isSearching={isSearching}
        isEmpty={payments.length === 0}
        loadingMessage="Loading payments from backend..."
        emptyContent={
          debouncedSearch ? (
            <div>
              <p>No payment records found matching "{debouncedSearch}".</p>
              <button
                type="button"
                onClick={clear}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            "No payment records found."
          )
        }
      >
        {payments.map((p) => (
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
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                  p.status,
                )}`}
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
              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
            </td>
            <td className="py-3.5 px-4 text-right">
              <button
                type="button"
                onClick={() => viewPaymentDetails(p)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Details
              </button>
            </td>
          </tr>
        ))}
      </ScrollableTable>

      {/* Modal: Payment Details */}
      <PaymentDetailModal
        selectedPayment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        bookingPaymentDetail={bookingPaymentDetail}
        fetchingDetail={fetchingDetail}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
