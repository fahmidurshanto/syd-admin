"use client";

export default function DeleteRouteModal({
  deleteTarget,
  onClose,
  onConfirm,
  submitting,
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-slate-900">
          Delete Route Fare?
        </h3>
        <p className="text-xs text-slate-500">
          Are you sure you want to delete the route fare from{" "}
          <b>{deleteTarget.firstPlace}</b> to{" "}
          <b>{deleteTarget.lastPlace}</b>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Deleting..." : "Delete Route"}
          </button>
        </div>
      </div>
    </div>
  );
}
