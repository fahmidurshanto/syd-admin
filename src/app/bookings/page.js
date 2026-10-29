"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Eye,
  Luggage,
  Trash2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import ScrollableTable from "@/components/ScrollableTable";
import { useSearchInput } from "@/hooks/useSearchInput";
import BookingDetailModal from "./components/BookingDetailModal";
import CancelBookingModal from "./components/CancelBookingModal";
import DeleteBookingModal from "./components/DeleteBookingModal";

const BOOKING_COLUMNS = [
  { label: "Booking Ref" },
  { label: "Passenger Details" },
  { label: "Pickup & Dropoff" },
  { label: "Pickup Time" },
  { label: "Vehicle" },
  { label: "Fare" },
  { label: "Payment" },
  { label: "Ride Status" },
  { label: "Actions", align: "right" },
];

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filters
  const {
    search,
    setSearch,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  } = useSearchInput();

  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState(
    "Cancelled by admin/dispatcher"
  );
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState(null);
  const [notesEdit, setNotesEdit] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getBookings({
        status: statusFilter !== "all" ? statusFilter : undefined,
        vehicleType: vehicleFilter !== "all" ? vehicleFilter : undefined,
        limit: 100,
      });
      if (res.success) {
        setBookings(res.bookings || []);
        setTotalCount(res.total || (res.bookings ? res.bookings.length : 0));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch bookings list.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [statusFilter, vehicleFilter, setIsSearching]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Turn off searching spinner when debounced value updates
  useEffect(() => {
    setIsSearching(false);
  }, [debouncedSearch, setIsSearching]);

  // Filtered bookings based on debounced search and payment filter
  const filteredBookings = bookings.filter((b) => {
    const term = debouncedSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      b.bookingNumber?.toLowerCase().includes(term) ||
      b.passengerName?.toLowerCase().includes(term) ||
      b.passengerPhone?.includes(term) ||
      b.passengerEmail?.toLowerCase().includes(term);

    const matchesPayment =
      paymentFilter === "all" || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const handleStatusChange = async (refOrId, newStatus) => {
    try {
      setActionLoading(true);
      await api.updateBookingStatus(refOrId, newStatus);
      await fetchBookings();
      if (
        selectedBooking &&
        (selectedBooking.bookingNumber === refOrId ||
          selectedBooking._id === refOrId)
      ) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert("Error updating status: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      await api.updateBookingDetails(selectedBooking.bookingNumber, {
        notes: notesEdit,
      });
      setSelectedBooking((prev) => ({ ...prev, notes: notesEdit }));
      await fetchBookings();
      alert("Notes saved successfully");
    } catch (e) {
      alert("Failed to save notes: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setActionLoading(true);
      await api.cancelBooking(
        cancelModalBooking.bookingNumber,
        cancelReason || "Cancelled by admin"
      );
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (e) {
      alert("Error cancelling booking: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteConfirmBooking) return;
    try {
      setActionLoading(true);
      await api.deleteBooking(deleteConfirmBooking.bookingNumber);
      setDeleteConfirmBooking(null);
      if (
        selectedBooking &&
        selectedBooking.bookingNumber === deleteConfirmBooking.bookingNumber
      ) {
        setSelectedBooking(null);
      }
      await fetchBookings();
    } catch (e) {
      alert("Error deleting booking: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setNotesEdit(booking.notes || "");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "completed":
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "in_progress":
      case "assigned":
      case "on_the_way":
      case "arrived":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "refunded":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Bookings Management"
        description="Search, update rides, manage dispatch status, passenger details and cancellations."
        icon={CalendarDays}
        onRefresh={fetchBookings}
        loading={loading}
      />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={clear}
            isLoading={isSearching}
            placeholder="Search reference, name, phone, email..."
            className="flex-1 min-w-[220px]"
          />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">
              Status:
            </span>
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
            <span className="text-xs font-semibold text-slate-500">
              Vehicle:
            </span>
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
            <span className="text-xs font-semibold text-slate-500">
              Payment:
            </span>
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
          Showing{" "}
          <span className="font-bold text-slate-800">
            {filteredBookings.length}
          </span>{" "}
          of {totalCount}
        </div>
      </div>

      {/* Error / Auth Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">
                Connection & Authentication Notice
              </p>
              <p className="mt-0.5 text-amber-700">{error}</p>
            </div>
          </div>
          <Link
            href="/login"
            className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Scrollable Bookings Table */}
      <ScrollableTable
        columns={BOOKING_COLUMNS}
        loading={loading}
        isSearching={isSearching}
        isEmpty={filteredBookings.length === 0}
        maxHeight="max-h-[calc(100vh-320px)]"
        minHeight="min-h-[350px]"
        loadingMessage="Loading bookings..."
        emptyContent={
          debouncedSearch ? (
            <div>
              <p>No bookings found matching "{debouncedSearch}".</p>
              <button
                type="button"
                onClick={clear}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            "No bookings found matching the selected criteria."
          )
        }
      >
        {filteredBookings.map((b) => {
          const fareTotal = typeof b.fare === "object" ? b.fare?.total : b.fare;
          const pickupName =
            typeof b.pickup === "object"
              ? b.pickup?.name || b.pickup?.address || "Pickup"
              : b.pickup;
          const dropoffName =
            typeof b.dropoff === "object"
              ? b.dropoff?.name || b.dropoff?.address || "Dropoff"
              : b.dropoff;

          return (
            <tr
              key={b.bookingNumber || b._id}
              className="hover:bg-slate-50/80 transition"
            >
              <td className="py-4 px-4 font-mono font-bold text-indigo-600">
                {b.bookingNumber}
              </td>
              <td className="py-4 px-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {b.passengerName}
                  </p>
                  <p className="text-xs text-slate-500">{b.passengerPhone}</p>
                </div>
              </td>
              <td className="py-4 px-4 max-w-xs">
                <div className="truncate text-xs text-slate-800">
                  <span className="font-medium text-slate-500">From:</span>{" "}
                  {pickupName}
                </div>
                {dropoffName && (
                  <div className="truncate text-xs text-slate-600 mt-0.5">
                    <span className="font-medium text-slate-500">To:</span>{" "}
                    {dropoffName}
                  </div>
                )}
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                {b.pickupTime
                  ? new Date(b.pickupTime).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </td>
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 uppercase inline-block">
                    {b.vehicleType}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <span>👤 {b.passengers || 1} pax</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-600">
                      <Luggage className="w-3 h-3 text-indigo-500" />{" "}
                      {b.luggage !== undefined
                        ? b.luggage
                        : b.notes?.match(/Luggage:\s*(\d+)/i)?.[1] || 0}{" "}
                      bags
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                ${fareTotal || "0"} AUD
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getPaymentBadge(
                    b.paymentStatus
                  )}`}
                >
                  {b.paymentStatus}
                </span>
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                    b.status
                  )}`}
                >
                  {b.status}
                </span>
              </td>
              <td className="py-4 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openDetailsModal(b)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition cursor-pointer"
                    title="View & Edit Booking Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {b.status === "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(b.bookingNumber, "confirmed")
                      }
                      disabled={actionLoading}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                      title="Quick Confirm"
                    >
                      Confirm
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => setCancelModalBooking(b)}
                      disabled={actionLoading}
                      className="p-1.5 rounded-lg bg-white hover:bg-amber-50 border border-amber-200 text-amber-600 shadow-xs transition cursor-pointer disabled:opacity-50"
                      title="Cancel Booking"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmBooking(b)}
                    disabled={actionLoading}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 shadow-xs transition cursor-pointer disabled:opacity-50"
                    title="Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </ScrollableTable>

      {/* Booking Details / Dispatch Modal */}
      <BookingDetailModal
        selectedBooking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        handleStatusChange={handleStatusChange}
        actionLoading={actionLoading}
        notesEdit={notesEdit}
        setNotesEdit={setNotesEdit}
        handleSaveNotes={handleSaveNotes}
        getStatusBadge={getStatusBadge}
        getPaymentBadge={getPaymentBadge}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        cancelModalBooking={cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onConfirm={handleCancelBooking}
        actionLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBookingModal
        deleteConfirmBooking={deleteConfirmBooking}
        onClose={() => setDeleteConfirmBooking(null)}
        onConfirm={handleDeleteBooking}
        actionLoading={actionLoading}
      />
    </div>
  );
}
