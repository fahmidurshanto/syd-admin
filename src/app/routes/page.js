"use client";

import {
  AlertCircle,
  Clock,
  Edit,
  MapPin,
  Plus,
  Route as RouteIcon,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ScrollableTable from "@/components/ScrollableTable";
import SearchInput from "@/components/SearchInput";
import { useSearchInput } from "@/hooks/useSearchInput";
import { api } from "@/lib/api";
import { routesCache } from "@/lib/routesCache";
import DeleteRouteModal from "./components/DeleteRouteModal";
import RouteModal from "./components/RouteModal";

const ROUTE_COLUMNS = [
  { label: "Route Path" },
  { label: "Distance & Duration" },
  { label: "Chauffeur Fare" },
  { label: "Taxi Fare" },
  { label: "Status" },
  { label: "Actions", align: "right" },
];

const getCacheKey = (searchTerm, filter) => {
  const term =
    typeof searchTerm === "string" ? searchTerm.trim().toLowerCase() : "";
  const filt = typeof filter === "string" ? filter : "all";
  return `${term}__${filt}`;
};

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState(() => routesCache.get("default") || []);
  const [loading, setLoading] = useState(() => !routesCache.has("default"));
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    search,
    setSearch,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  } = useSearchInput();

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
    chauffeurExtraPerPerson: "",
    taxiExtraPerPerson: "",
    distanceKm: "",
    durationMin: "",
    firstPlaceAddress: "",
    firstPlaceCode: "",
    lastPlaceAddress: "",
    lastPlaceCode: "",
    currency: "AUD",
    isActive: true,
    notes: "",
  });

  const fetchRoutes = useCallback(
    async (
      searchTerm = debouncedSearch,
      filter = activeFilter,
      force = false,
    ) => {
      const term =
        typeof searchTerm === "string" ? searchTerm : debouncedSearch;
      const filt = typeof filter === "string" ? filter : activeFilter;
      const shouldForce = force === true || typeof searchTerm !== "string";
      const isDefault = !term?.trim() && filt === "all";
      const cacheKey = isDefault ? "default" : getCacheKey(term, filt);

      if (!shouldForce && routesCache.has(cacheKey)) {
        setRoutes(routesCache.get(cacheKey));
        setLoading(false);
        setIsSearching(false);
        return;
      }

      try {
        if (shouldForce || !routesCache.has("default")) {
          setLoading(true);
        }
        setIsSearching(true);
        setError(null);
        const params = { limit: 500 };
        if (term?.trim()) params.search = term.trim();
        if (filt !== "all") params.isActive = filt === "active";

        const res = await api.getRoutes(params);
        if (res.success) {
          const list = res.routes || res.places || [];
          routesCache.set(cacheKey, list);
          if (isDefault) {
            routesCache.set("default", list);
          }
          setRoutes(list);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch routes.");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearch, activeFilter, setIsSearching],
  );

  // Trigger search with race condition prevention and cache lookup
  useEffect(() => {
    let isCurrent = true;
    const isDefault = !debouncedSearch?.trim() && activeFilter === "all";
    const cacheKey = isDefault
      ? "default"
      : getCacheKey(debouncedSearch, activeFilter);

    if (routesCache.has(cacheKey)) {
      setRoutes(routesCache.get(cacheKey));
      setLoading(false);
      setIsSearching(false);
      return;
    }

    const performFetch = async () => {
      try {
        if (!routesCache.has("default")) {
          setLoading(true);
        }
        setIsSearching(true);
        setError(null);
        const params = { limit: 500 };
        if (debouncedSearch?.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (activeFilter !== "all") {
          params.isActive = activeFilter === "active";
        }

        const res = await api.getRoutes(params);
        if (isCurrent && res.success) {
          const list = res.routes || res.places || [];
          routesCache.set(cacheKey, list);
          if (isDefault) {
            routesCache.set("default", list);
          }
          setRoutes(list);
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setError(err.message || "Failed to fetch routes.");
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
          setIsSearching(false);
        }
      }
    };

    performFetch();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, activeFilter, setIsSearching]);

  const openCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      firstPlace: "",
      lastPlace: "",
      chauffeurFare: "",
      taxiFare: "",
      chauffeurExtraPerPerson: "",
      taxiExtraPerPerson: "",
      distanceKm: "",
      durationMin: "",
      firstPlaceAddress: "",
      firstPlaceCode: "",
      lastPlaceAddress: "",
      lastPlaceCode: "",
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

    const extraFares =
      route.increaseFarePerPerson instanceof Map
        ? Object.fromEntries(route.increaseFarePerPerson)
        : route.increaseFarePerPerson || {};

    setFormData({
      firstPlace: route.firstPlace || "",
      lastPlace: route.lastPlace || "",
      chauffeurFare: fares.Chauffeur !== undefined ? fares.Chauffeur : "",
      taxiFare: fares.Taxi !== undefined ? fares.Taxi : "",
      chauffeurExtraPerPerson:
        extraFares.Chauffeur !== undefined ? extraFares.Chauffeur : "",
      taxiExtraPerPerson:
        extraFares.Taxi !== undefined ? extraFares.Taxi : "",
      distanceKm: route.distanceKm || "",
      durationMin: route.durationMin || "",
      firstPlaceAddress: route.firstPlaceDetails?.address || "",
      firstPlaceCode: route.firstPlaceDetails?.code || "",
      lastPlaceAddress: route.lastPlaceDetails?.address || "",
      lastPlaceCode: route.lastPlaceDetails?.code || "",
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

      const increaseFarePerPerson = {};
      if (formData.chauffeurExtraPerPerson !== "") {
        increaseFarePerPerson.Chauffeur = Number(formData.chauffeurExtraPerPerson);
      }
      if (formData.taxiExtraPerPerson !== "") {
        increaseFarePerPerson.Taxi = Number(formData.taxiExtraPerPerson);
      }

      const firstPlaceDetails = {};
      if (formData.firstPlaceAddress) firstPlaceDetails.address = formData.firstPlaceAddress.trim();
      if (formData.firstPlaceCode) firstPlaceDetails.code = formData.firstPlaceCode.trim();

      const lastPlaceDetails = {};
      if (formData.lastPlaceAddress) lastPlaceDetails.address = formData.lastPlaceAddress.trim();
      if (formData.lastPlaceCode) lastPlaceDetails.code = formData.lastPlaceCode.trim();

      const payload = {
        firstPlace: formData.firstPlace.trim(),
        lastPlace: formData.lastPlace.trim(),
        vehicleAndFares,
        increaseFarePerPerson,
        currency: formData.currency.toUpperCase() || "AUD",
        distanceKm: formData.distanceKm ? Number(formData.distanceKm) : null,
        durationMin: formData.durationMin ? Number(formData.durationMin) : null,
        firstPlaceDetails,
        lastPlaceDetails,
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
      routesCache.clear();
      await fetchRoutes(debouncedSearch, activeFilter, true);
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
      routesCache.clear();
      await fetchRoutes(debouncedSearch, activeFilter, true);
    } catch (err) {
      alert(`Failed to delete route: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    routesCache.clear();
    await fetchRoutes(debouncedSearch, activeFilter, true);
  }, [debouncedSearch, activeFilter, fetchRoutes]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Routes & Fares"
        description="Manage origin-destination pairs, fixed vehicle fares, and travel durations."
        icon={RouteIcon}
        onRefresh={handleRefresh}
        loading={loading}
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Route Fare
          </button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={clear}
          isLoading={isSearching}
          placeholder="Search origin or destination..."
          className="w-full sm:flex-1 sm:max-w-md"
        />

        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          {isSearching && (
            <span className="text-xs text-indigo-600 font-medium animate-pulse">
              Searching...
            </span>
          )}
          <label
            htmlFor="route-status-filter"
            className="text-xs font-medium text-slate-500 shrink-0"
          >
            Status:
          </label>
          <select
            id="route-status-filter"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

      {/* Scrollable Routes Table */}
      <ScrollableTable
        columns={ROUTE_COLUMNS}
        loading={loading}
        isSearching={isSearching}
        isEmpty={routes.length === 0}
        loadingMessage="Loading routes..."
        emptyContent={
          debouncedSearch ? (
            <div>
              <p>No route fares found matching "{debouncedSearch}".</p>
              <button
                type="button"
                onClick={clear}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            'No route fares found. Click "Add Route Fare" to create one.'
          )
        }
      >
        {routes.map((route) => {
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
                  <div>
                    <div>${fares.Chauffeur} {currency}</div>
                    {route.increaseFarePerPerson?.Chauffeur ? (
                      <span className="text-[10px] text-indigo-600 font-normal">
                        +${route.increaseFarePerPerson.Chauffeur}/person
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal">N/A</span>
                )}
              </td>
              <td className="py-3.5 px-4 font-semibold text-slate-900">
                {fares.Taxi !== undefined ? (
                  <div>
                    <div>${fares.Taxi} {currency}</div>
                    {route.increaseFarePerPerson?.Taxi ? (
                      <span className="text-[10px] text-amber-600 font-normal">
                        +${route.increaseFarePerPerson.Taxi}/person
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-slate-400 font-normal">N/A</span>
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
                    type="button"
                    onClick={() => openEditModal(route)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Edit Route"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(route)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </ScrollableTable>

      {/* Modal: Create / Edit Route */}
      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRoute={editingRoute}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSaveRoute}
        submitting={submitting}
      />

      {/* Modal: Delete Confirmation */}
      <DeleteRouteModal
        deleteTarget={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        submitting={submitting}
      />
    </div>
  );
}
