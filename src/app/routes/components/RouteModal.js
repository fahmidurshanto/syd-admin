"use client";

import { Route as RouteIcon, X } from "lucide-react";

export default function RouteModal({
  isOpen,
  onClose,
  editingRoute,
  formData,
  setFormData,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-indigo-600" />
            {editingRoute ? "Edit Route Fare" : "Create New Route Fare"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Origin / Pickup
              </label>
              <input
                type="text"
                required
                value={formData.firstPlace}
                onChange={(e) =>
                  setFormData({ ...formData, firstPlace: e.target.value })
                }
                placeholder="e.g. Sydney Airport"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Destination / Dropoff
              </label>
              <input
                type="text"
                required
                value={formData.lastPlace}
                onChange={(e) =>
                  setFormData({ ...formData, lastPlace: e.target.value })
                }
                placeholder="e.g. Sydney CBD"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chauffeur Fare ($ AUD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.chauffeurFare}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chauffeurFare: e.target.value,
                  })
                }
                placeholder="e.g. 120"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taxi Fare ($ AUD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.taxiFare}
                onChange={(e) =>
                  setFormData({ ...formData, taxiFare: e.target.value })
                }
                placeholder="e.g. 75"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Distance (km)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.distanceKm}
                onChange={(e) =>
                  setFormData({ ...formData, distanceKm: e.target.value })
                }
                placeholder="e.g. 15.5"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Duration (mins)
              </label>
              <input
                type="number"
                min="0"
                value={formData.durationMin}
                onChange={(e) =>
                  setFormData({ ...formData, durationMin: e.target.value })
                }
                placeholder="e.g. 25"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Notes / Description
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Optional internal notes or route specifications"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="font-semibold text-slate-700 select-none cursor-pointer"
            >
              Route is active & bookable
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {submitting
                ? "Saving..."
                : editingRoute
                  ? "Update Route"
                  : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
