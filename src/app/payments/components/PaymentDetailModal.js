"use client";

import { CreditCard, ExternalLink, RefreshCw, X } from "lucide-react";

export default function PaymentDetailModal({
  selectedPayment,
  onClose,
  bookingPaymentDetail,
  fetchingDetail,
  getStatusBadge,
}) {
  if (!selectedPayment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            Payment Record: {selectedPayment.bookingNumber}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                {selectedPayment.currency || "AUD"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Stripe Intent ID</span>
              <span className="font-mono text-slate-700">
                {selectedPayment.stripePaymentIntentId || "-"}
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
                  {bookingPaymentDetail.fare?.total || selectedPayment.amount}
                </b>
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
