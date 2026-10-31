"use client";

import { AlertTriangle } from "lucide-react";

export default function CancelBookingModal({
  cancelModalBooking,
  onClose,
  cancelReason,
  setCancelReason,
  onConfirm,
  actionLoading,
}) {
  if (!cancelModalBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">Cancel Booking</h3>
        </div>
        <p className="text-xs text-slate-600">
          Are you sure you want to cancel booking{" "}
          <strong className="text-slate-900">
            {cancelModalBooking.bookingNumber}
          </strong>{" "}
          for {cancelModalBooking.passengerName}?
        </p>
        <div className="space-y-1.5">
          <label
            htmlFor="cancel-reason-input"
            className="text-xs font-semibold text-slate-600"
          >
            Cancellation Reason:
          </label>
          <input
            id="cancel-reason-input"
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}
