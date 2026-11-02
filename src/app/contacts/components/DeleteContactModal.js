"use client";

import { AlertTriangle, RefreshCw, Trash2, X } from "lucide-react";

export default function DeleteContactModal({
  contact,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Delete Enquiry
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to permanently delete the contact enquiry from{" "}
          <strong className="text-slate-900 font-semibold">
            {contact.fullName}
          </strong>{" "}
          ({contact.email})?
        </p>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
          <p className="text-slate-500 font-medium">Subject:</p>
          <p className="text-slate-800 font-semibold truncate">
            {contact.subject || "General Enquiry"}
          </p>
        </div>

        <p className="text-[11px] text-rose-600 font-medium">
          Warning: This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(contact._id)}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete Enquiry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
