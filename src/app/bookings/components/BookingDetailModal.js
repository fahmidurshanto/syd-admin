"use client";

import {
  Car,
  DollarSign,
  FileText,
  Luggage,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

export default function BookingDetailModal({
  selectedBooking,
  onClose,
  handleStatusChange,
  actionLoading,
  notesEdit,
  setNotesEdit,
  handleSaveNotes,
  getStatusBadge,
  getPaymentBadge,
}) {
  if (!selectedBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
              Booking Management
            </span>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {selectedBooking.bookingNumber}
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${getStatusBadge(
                  selectedBooking.status
                )}`}
              >
                {selectedBooking.status}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Status Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Update Dispatch Status
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              "pending",
              "confirmed",
              "assigned",
              "on_the_way",
              "arrived",
              "in_progress",
              "completed",
            ].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() =>
                  handleStatusChange(selectedBooking.bookingNumber, st)
                }
                disabled={actionLoading || selectedBooking.status === st}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer disabled:opacity-40 ${
                  selectedBooking.status === st
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {st.replace(/_/g, " ")}
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
            <p className="font-bold text-slate-900 text-base">
              {selectedBooking.passengerName}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
              {selectedBooking.passengerPhone}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />{" "}
              {selectedBooking.passengerEmail}
            </p>
          </div>

          {/* Ride & Vehicle Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-indigo-600" /> Vehicle & Capacity
            </span>
            <p className="font-bold text-indigo-700 text-base capitalize">
              {selectedBooking.vehicleType}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-700 pt-0.5">
              <p>
                Passengers:{" "}
                <strong className="text-slate-900 font-bold">
                  {selectedBooking.passengers || 1}
                </strong>
              </p>
              <span>•</span>
              <p className="flex items-center gap-1">
                <Luggage className="w-3.5 h-3.5 text-indigo-600" />
                Luggage:{" "}
                <strong className="text-slate-900 font-bold">
                  {selectedBooking.luggage !== undefined
                    ? selectedBooking.luggage
                    : selectedBooking.notes?.match(/Luggage:\s*(\d+)/i)?.[1] ||
                      0}{" "}
                  bags
                </strong>
              </p>
            </div>
            <p className="text-xs text-slate-600">
              Pickup Date/Time:{" "}
              <strong className="text-slate-800">
                {new Date(selectedBooking.pickupTime).toLocaleString()}
              </strong>
            </p>
          </div>

          {/* Locations */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 sm:col-span-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Route &
              Destinations
            </span>
            <div className="space-y-1 text-xs">
              <p className="text-slate-700">
                <strong className="text-slate-900">Pickup:</strong>{" "}
                {typeof selectedBooking.pickup === "object"
                  ? selectedBooking.pickup.name || selectedBooking.pickup.address
                  : selectedBooking.pickup}
              </p>
              <p className="text-slate-700">
                <strong className="text-slate-900">Dropoff:</strong>{" "}
                {typeof selectedBooking.dropoff === "object"
                  ? selectedBooking.dropoff.name || selectedBooking.dropoff.address
                  : selectedBooking.dropoff || "Not specified"}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payment &
              Billing
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div>
                <span className="text-slate-400 block">Total Fare</span>
                <strong className="text-sm font-bold text-slate-900">
                  $
                  {typeof selectedBooking.fare === "object"
                    ? selectedBooking.fare?.total
                    : selectedBooking.fare}{" "}
                  AUD
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold uppercase ${getPaymentBadge(
                    selectedBooking.paymentStatus
                  )}`}
                >
                  {selectedBooking.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Method</span>
                <span className="font-semibold text-slate-700 capitalize">
                  {selectedBooking.paymentDetails?.paymentMethod ||
                    "Stripe / Card"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Stripe Intent</span>
                <span className="font-mono text-[10px] text-slate-600 truncate block max-w-[130px]">
                  {selectedBooking.paymentDetails?.paymentIntentId || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Internal Notes / Instructions */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Internal Notes /
            Driver Instructions
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
              type="button"
              onClick={handleSaveNotes}
              disabled={actionLoading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
