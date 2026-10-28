"use client";

import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardOverview() {
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchRef, setSearchRef] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchDashboardData = async () => {
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
      if (err.status === 401) {
        setError(
          "Authentication required to access admin bookings. Please sign in.",
        );
      } else {
        setError(
          err.message ||
            "Could not connect to the backend API. Please make sure syd-bookings-server is running on port 5000.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Metrics
  const totalRevenue = bookings.reduce((acc, b) => {
    if (b.paymentStatus === "paid") {
      const fareAmount =
        typeof b.fare === "object"
          ? Number(b.fare?.total || 0)
          : Number(b.fare || 0);
      return acc + (isNaN(fareAmount) ? 0 : fareAmount);
    }
    return acc;
  }, 0);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) =>
    ["confirmed", "assigned", "on_the_way", "arrived", "in_progress"].includes(
      b.status,
    ),
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  // Filtered recent list
  const filteredBookings = bookings.filter((b) => {
    const matchesRef = searchRef
      ? b.bookingNumber?.toLowerCase().includes(searchRef.toLowerCase()) ||
        b.passengerName?.toLowerCase().includes(searchRef.toLowerCase()) ||
        b.passengerPhone?.includes(searchRef)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : b.status === statusFilter;
    return matchesRef && matchesStatus;
  });

  const handleStatusChange = async (bookingNumber, newStatus) => {
    try {
      setIsUpdating(true);
      await api.updateBookingStatus(bookingNumber, newStatus);
      await fetchDashboardData();
      if (selectedBooking && selectedBooking.bookingNumber === bookingNumber) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "in_progress":
      case "assigned":
      case "on_the_way":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Operations & Fleet Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Real-time analytics, booking inquiries, and fleet status monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Backend Alert if offline */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {totalCount}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">
              All recorded
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Live sync with MongoDB
          </div>
        </div>

        {/* Revenue Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paid Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              $
              {totalRevenue.toLocaleString("en-AU", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-slate-400 font-medium">AUD</span>
          </div>
          <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Stripe verified payments
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {pendingBookings.length}
            </span>
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Action Needed
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Awaiting confirmation or assignment
          </div>
        </div>

        {/* Confirmed / Active Fleet */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active & Confirmed
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-600">
              {confirmedBookings.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Confirmed / Running
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Completed: {completedBookings.length} | Cancelled:{" "}
            {cancelledBookings.length}
          </div>
        </div>
      </div>

      {/* Recent Bookings Section with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Bookings & Rides
            </h3>
            <p className="text-xs text-slate-500">
              Manage incoming booking orders, update ride status and review
              payments
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Reference, Name, Phone..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-medium py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Passenger</th>
                  <th className="py-3.5 px-4">Route (Pick / Drop)</th>
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
                    <td
                      colSpan="8"
                      className="py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                        <span>Loading bookings data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-12 text-center text-slate-500"
                    >
                      No bookings found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const fareTotal =
                      typeof b.fare === "object" ? b.fare?.total : b.fare;
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
                            <p className="text-xs text-slate-500">
                              {b.passengerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="truncate text-xs text-slate-800">
                            <span className="font-medium text-slate-500">
                              From:
                            </span>{" "}
                            {pickupName}
                          </div>
                          {dropoffName && (
                            <div className="truncate text-xs text-slate-600 mt-0.5">
                              <span className="font-medium text-slate-500">
                                To:
                              </span>{" "}
                              {dropoffName}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 uppercase">
                            {b.vehicleType}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">
                          ${fareTotal || "0"} AUD
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getPaymentBadge(b.paymentStatus)}`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(b.status)}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {b.status === "pending" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    b.bookingNumber,
                                    "confirmed",
                                  )
                                }
                                disabled={isUpdating}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
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
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-xl relative text-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                  Booking Details
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedBooking.bookingNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">
                  Passenger
                </span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  {selectedBooking.passengerName}
                </span>
                <span className="text-xs text-slate-600 block">
                  {selectedBooking.passengerPhone}
                </span>
                <span className="text-xs text-slate-500 block">
                  {selectedBooking.passengerEmail}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">
                  Vehicle & Passengers
                </span>
                <span className="text-base font-bold text-indigo-700 block mt-0.5 capitalize">
                  {selectedBooking.vehicleType}
                </span>
                <span className="text-xs text-slate-600 block">
                  Passengers: {selectedBooking.passengers || 1}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2">
                <span className="text-xs text-slate-500 block font-semibold">
                  Locations
                </span>
                <p className="text-xs text-slate-700 mt-1">
                  <strong className="text-slate-900">Pickup:</strong>{" "}
                  {typeof selectedBooking.pickup === "object"
                    ? selectedBooking.pickup.name ||
                      selectedBooking.pickup.address
                    : selectedBooking.pickup}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  <strong className="text-slate-900">Dropoff:</strong>{" "}
                  {typeof selectedBooking.dropoff === "object"
                    ? selectedBooking.dropoff.name ||
                      selectedBooking.dropoff.address
                    : selectedBooking.dropoff || "N/A"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">
                  Payment Status
                </span>
                <span className="text-sm font-bold text-emerald-600 block mt-0.5 uppercase">
                  {selectedBooking.paymentStatus}
                </span>
                <span className="text-xs text-slate-600">
                  Total: $
                  {typeof selectedBooking.fare === "object"
                    ? selectedBooking.fare?.total
                    : selectedBooking.fare}{" "}
                  AUD
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 block font-semibold">
                  Ride Status
                </span>
                <span className="text-sm font-bold text-indigo-600 block mt-0.5 uppercase">
                  {selectedBooking.status}
                </span>
                <span className="text-[11px] text-slate-500">
                  Created:{" "}
                  {new Date(selectedBooking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-600">
                Change Status:
              </div>
              <div className="flex items-center gap-2">
                {["pending", "confirmed", "completed", "cancelled"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() =>
                        handleStatusChange(selectedBooking.bookingNumber, st)
                      }
                      disabled={isUpdating || selectedBooking.status === st}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer disabled:opacity-40 ${
                        selectedBooking.status === st
                          ? "bg-indigo-600 text-white"
                          : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
                      }`}
                    >
                      {st}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
