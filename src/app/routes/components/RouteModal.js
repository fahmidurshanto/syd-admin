"use client";

import { MapPin, Route as RouteIcon, Users, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-4 h-4 text-indigo-600" />
            {editingRoute ? "Edit Route Fare" : "Create New Route Fare"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Origin / Pickup *
              </label>
              <input
                type="text"
                required
                value={formData.firstPlace}
                onChange={(e) =>
                  setFormData({ ...formData, firstPlace: e.target.value })
                }
                placeholder="e.g. Sydney Airport (SYD)"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Destination / Dropoff *
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

          {/* Base Vehicle Fares */}
          <div>
            <span className="block font-semibold text-slate-700 mb-1.5">
              Base Vehicle Fares ($ AUD) *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Chauffeur Fare
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
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Taxi Fare
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
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Increase Fare Per Person (New Schema Field) */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Increase Fare Per Passenger (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Extra / Person (Chauffeur)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.chauffeurExtraPerPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chauffeurExtraPerPerson: e.target.value,
                    })
                  }
                  placeholder="e.g. 15"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Extra / Person (Taxi)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxiExtraPerPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxiExtraPerPerson: e.target.value,
                    })
                  }
                  placeholder="e.g. 10"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Distance and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Location Specific Details (Optional) */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Location Details & Codes (Optional)</span>
            </div>
            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Pickup Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.firstPlaceAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstPlaceAddress: e.target.value,
                      })
                    }
                    placeholder="Mascot NSW 2020, Australia"
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Pickup Code
                  </label>
                  <input
                    type="text"
                    value={formData.firstPlaceCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstPlaceCode: e.target.value,
                      })
                    }
                    placeholder="SYD"
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Dropoff Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.lastPlaceAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastPlaceAddress: e.target.value,
                      })
                    }
                    placeholder="Sydney NSW 2000, Australia"
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Dropoff Code
                  </label>
                  <input
                    type="text"
                    value={formData.lastPlaceCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastPlaceCode: e.target.value,
                      })
                    }
                    placeholder="CBD"
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
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

          {/* Active status */}
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

          {/* Actions */}
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
