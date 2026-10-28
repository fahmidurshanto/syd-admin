"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstPlace: "",
    lastPlace: "",
    chauffeurFare: "",
    taxiFare: "",
    distanceKm: "",
    durationMin: "",
    currency: "AUD",
    isActive: true,
    notes: "",
  });

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (activeFilter !== "all") params.isActive = activeFilter === "active";

      const res = await api.getRoutes(params);
      if (res.success) {
        setRoutes(res.routes || res.places || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch routes from backend.");
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const openCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      firstPlace: "",
      lastPlace: "",
      chauffeurFare: "",
      taxiFare: "",
      distanceKm: "",
      durationMin: "",
      currency: "AUD",
      isActive: true,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    const fares =
      route.vehicleAndFares instanceof Map
        ? Object.fromEntries(route.vehicleAndFares)
        : route.vehicleAndFares || {};

    setFormData({
      firstPlace: route.firstPlace || "",
      lastPlace: route.lastPlace || "",
      chauffeurFare: fares.Chauffeur !== undefined ? fares.Chauffeur : "",
      taxiFare: fares.Taxi !== undefined ? fares.Taxi : "",
      distanceKm: route.distanceKm || "",
      durationMin: route.durationMin || "",
      currency: route.currency || "AUD",
      isActive: route.isActive !== undefined ? route.isActive : true,
      notes: route.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const vehicleAndFares = {};
      if (formData.chauffeurFare !== "")
        vehicleAndFares.Chauffeur = Number(formData.chauffeurFare);
      if (formData.taxiFare !== "")
        vehicleAndFares.Taxi = Number(formData.taxiFare);

      if (Object.keys(vehicleAndFares).length === 0) {
        alert("Please specify at least one vehicle fare (Chauffeur or Taxi).");
        setSubmitting(false);
        return;
      }

      const payload = {
        firstPlace: formData.firstPlace.trim(),
        lastPlace: formData.lastPlace.trim(),
        vehicleAndFares,
        currency: formData.currency.toUpperCase() || "AUD",
        distanceKm: formData.distanceKm ? Number(formData.distanceKm) : null,
        durationMin: formData.durationMin ? Number(formData.durationMin) : null,
        isActive: formData.isActive,
        notes: formData.notes.trim(),
      };

      if (editingRoute) {
        const routeId = editingRoute._id || editingRoute.id;
        await api.updateRoute(routeId, payload);
      } else {
        await api.createRoute(payload);
      }

      setIsModalOpen(false);
      await fetchRoutes();
    } catch (err) {
      alert(`Error saving route: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const routeId = deleteTarget._id || deleteTarget.id;
      await api.deleteRoute(routeId);
      setDeleteTarget(null);
      await fetchRoutes();
    } catch (err) {
      alert(`Failed to delete route: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <RouteIcon className="w-6 h-6 text-indigo-600" />
            Routes & Fares
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage origin-destination pairs, fixed vehicle fares, and travel
            durations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRoutes}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Route Fare
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search origin or destination..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-medium text-slate-500">Status:</label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Routes</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Routes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Route Path</th>
                <th className="py-3 px-4">Distance & Duration</th>
                <th className="py-3 px-4">Chauffeur Fare</th>
                <th className="py-3 px-4">Taxi Fare</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && routes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading routes from backend...
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    No route fares found. Click "Add Route Fare" to create one.
                  </td>
                </tr>
              ) : (
                routes.map((route) => {
                  const fares =
                    route.vehicleAndFares instanceof Map
                      ? Object.fromEntries(route.vehicleAndFares)
                      : route.vehicleAndFares || {};
                  const currency = route.currency || "AUD";

                  return (
                    <tr
                      key={route._id || route.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-slate-900">
                            {route.firstPlace}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-900">
                            {route.lastPlace}
                          </span>
                        </div>
                        {route.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {route.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-3">
                          {route.distanceKm ? (
                            <span>{route.distanceKm} km</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                          {route.durationMin && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {route.durationMin} mins
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fares.Chauffeur !== undefined ? (
                          `$${fares.Chauffeur} ${currency}`
                        ) : (
                          <span className="text-slate-400 font-normal">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fares.Taxi !== undefined ? (
                          `$${fares.Taxi} ${currency}`
                        ) : (
                          <span className="text-slate-400 font-normal">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            route.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {route.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(route)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
                            title="Edit Route"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(route)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Delete Route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal: Create / Edit Route */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-indigo-600" />
                {editingRoute ? "Edit Route Fare" : "Create New Route Fare"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4 text-xs">
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
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label
                  htmlFor="isActive"
                  className="font-semibold text-slate-700 select-none"
                >
                  Route is active & bookable
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60 shadow-xs"
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
      )}

      {/* Modal: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
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
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Delete Route"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
