"use client";

import { Trash2 } from "lucide-react";

export default function DeleteBookingModal({
  deleteConfirmBooking,
  onClose,
  onConfirm,
  actionLoading,
}) {
  if (!deleteConfirmBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <Trash2 className="w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">
            Permanently Delete Booking
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          This will permanently delete booking{" "}
          <strong className="text-slate-900">
            {deleteConfirmBooking.bookingNumber}
          </strong>{" "}
          from the database. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {actionLoading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
