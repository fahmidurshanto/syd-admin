<<<<<<< HEAD
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
=======
'use client';

import { useEffect, useState } from 'react';
import { 
  Route as RouteIcon, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  Car
} from 'lucide-react';
import { api } from '@/lib/api';

const VEHICLE_KEYS = [
  { key: 'taxi', label: 'Taxi' },
  { key: 'executive', label: 'Executive' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'suv', label: 'SUV' },
  { key: 'mpv', label: 'MPV' },
  { key: 'van', label: 'Van' },
];

export default function RoutesManagementPage() {
  const [routes, setRoutes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals
  const [editingRoute, setEditingRoute] = useState(null); // Route object or 'new'
  const [deleteModalRoute, setDeleteModalRoute] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstPlace: '',
    lastPlace: '',
    isActive: true,
    currency: 'AUD',
    notes: '',
    vehicleAndFares: {
      taxi: 150,
      executive: 190,
      luxury: 240,
      suv: 210,
      mpv: 220,
      van: 260,
    },
    increaseFarePerPerson: {
      taxi: 10,
      executive: 10,
      luxury: 15,
      suv: 12,
      mpv: 12,
      van: 15,
    }
  });

  const fetchRoutes = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * limit;
      const res = await api.getRoutes({
        search: searchTerm || undefined,
        isActive: activeFilter !== 'all' ? activeFilter : undefined,
        limit,
        skip,
      });

      if (res.success) {
        setRoutes(res.routes || res.places || []);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes(page);
  }, [page, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRoutes(1);
  };

  const openNewRouteModal = () => {
    setFormData({
      firstPlace: '',
      lastPlace: '',
      isActive: true,
      currency: 'AUD',
      notes: '',
      vehicleAndFares: {
        taxi: 150,
        executive: 190,
        luxury: 240,
        suv: 210,
        mpv: 220,
        van: 260,
      },
      increaseFarePerPerson: {
        taxi: 10,
        executive: 10,
        luxury: 15,
        suv: 12,
        mpv: 12,
        van: 15,
      }
    });
    setEditingRoute('new');
  };

  const openEditModal = (route) => {
    const vf = route.vehicleAndFares || {};
    const inc = route.increaseFarePerPerson || {};
    setFormData({
      firstPlace: route.firstPlace || '',
      lastPlace: route.lastPlace || '',
      isActive: route.isActive !== undefined ? route.isActive : true,
      currency: route.currency || 'AUD',
      notes: route.notes || '',
      vehicleAndFares: {
        taxi: vf.taxi || 150,
        executive: vf.executive || 190,
        luxury: vf.luxury || 240,
        suv: vf.suv || 210,
        mpv: vf.mpv || 220,
        van: vf.van || 260,
      },
      increaseFarePerPerson: {
        taxi: inc.taxi || 10,
        executive: inc.executive || 10,
        luxury: inc.luxury || 15,
        suv: inc.suv || 12,
        mpv: inc.mpv || 12,
        van: inc.van || 15,
      }
    });
    setEditingRoute(route);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingRoute === 'new') {
        await api.createRoute(formData);
        alert('Route created successfully');
      } else {
        await api.updateRoute(editingRoute._id || editingRoute.id, formData);
        alert('Route updated successfully');
      }
      setEditingRoute(null);
      await fetchRoutes(page);
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteModalRoute) return;
    try {
      setActionLoading(true);
      await api.deleteRoute(deleteModalRoute._id || deleteModalRoute.id);
      setDeleteModalRoute(null);
      await fetchRoutes(page);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Generate numbered pages with smart ellipsis
  const getPaginationPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-6 h-6 text-indigo-600" />
            Routes & Pricing Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure origin-to-destination routes, vehicle fare tiers, and extra passenger pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRoutes(page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openNewRouteModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Route
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
          </button>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search origin or destination (e.g. Abbotsbury, Sydney CBD)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Search
          </button>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Routes</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </form>

        <div className="text-xs font-medium text-slate-500">
          Total Routes: <span className="font-bold text-slate-800">{totalCount}</span>
        </div>
      </div>

      {/* Routes Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Origin (From)</th>
                <th className="py-3.5 px-4">Destination (To)</th>
                <th className="py-3.5 px-4">Fares by Vehicle (AUD)</th>
                <th className="py-3.5 px-4">Extra / Person</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading routes...</span>
                    </div>
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
<<<<<<< HEAD
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
=======
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <p className="font-semibold text-slate-800 text-base">No routes found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search term or add a new route.</p>
                  </td>
                </tr>
              ) : (
                routes.map((r) => {
                  const vf = r.vehicleAndFares || {};
                  const inc = r.increaseFarePerPerson || {};

                  return (
                    <tr key={r._id || r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{r.firstPlace}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r.lastPlace}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(vf).map(([veh, fare]) => (
                            <span key={veh} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 capitalize">
                              {veh}: <span className="text-indigo-600 font-bold">${fare}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(inc).map(([veh, extra]) => (
                            <span key={veh} className="text-[11px] text-slate-500 capitalize">
                              {veh}: +${extra}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {r.isActive !== false ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(r)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs transition cursor-pointer"
                            title="Edit Route"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModalRoute(r)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 shadow-xs transition cursor-pointer"
                            title="Delete Route"
                          >
                            <Trash2 className="w-4 h-4" />
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
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
<<<<<<< HEAD
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
=======

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Total & current page indicator */}
            <span className="text-xs text-slate-500 font-medium order-2 sm:order-1">
              Showing page <strong className="text-slate-800 font-bold">{page}</strong> of <strong className="text-slate-800 font-bold">{totalPages}</strong> ({totalCount} total)
            </span>

            {/* Center: Numbered Buttons & Arrows */}
            <div className="flex items-center gap-1.5 order-1 sm:order-2 sm:mx-auto">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Number Buttons */}
              {getPaginationPages().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-slate-400 font-bold text-xs select-none"
                    >
                      ...
                    </span>
                  );
                }

                const isActive = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right placeholder to keep center aligned on desktop */}
            <div className="hidden sm:block w-36 order-3" />
          </div>
        )}
      </div>

      {/* Add / Edit Route Modal */}
      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">Route Configuration</span>
                <h3 className="text-2xl font-black text-slate-900">
                  {editingRoute === 'new' ? 'Add New Route & Fares' : `Edit Route: ${editingRoute.firstPlace} ➔ ${editingRoute.lastPlace}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingRoute(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Origin and Destination Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Origin (From Place)</label>
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                  <input
                    type="text"
                    required
                    value={formData.firstPlace}
<<<<<<< HEAD
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
=======
                    onChange={(e) => setFormData({ ...formData, firstPlace: e.target.value })}
                    placeholder="e.g. Abbotsbury"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Destination (To Place)</label>
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                  <input
                    type="text"
                    required
                    value={formData.lastPlace}
<<<<<<< HEAD
                    onChange={(e) =>
                      setFormData({ ...formData, lastPlace: e.target.value })
                    }
                    placeholder="e.g. Sydney CBD"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
=======
                    onChange={(e) => setFormData({ ...formData, lastPlace: e.target.value })}
                    placeholder="e.g. Sydney Airport (SYD)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                  />
                </div>
              </div>

<<<<<<< HEAD
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
=======
              {/* Vehicle Fares Inputs */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-indigo-600" /> Base Fares by Vehicle Type (AUD)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VEHICLE_KEYS.map((v) => (
                    <div key={v.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">{v.label} Fare ($)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.vehicleAndFares[v.key] ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          vehicleAndFares: {
                            ...formData.vehicleAndFares,
                            [v.key]: Number(e.target.value),
                          }
                        })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Passenger Surcharges */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Additional Fare Per Person ($)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VEHICLE_KEYS.map((v) => (
                    <div key={v.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">{v.label} Extra ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.increaseFarePerPerson[v.key] ?? ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          increaseFarePerPerson: {
                            ...formData.increaseFarePerPerson,
                            [v.key]: Number(e.target.value),
                          }
                        })}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="true">Active (Visible for online quotes)</option>
                    <option value="false">Inactive (Disabled)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Internal Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Airport Transfer, Tolls included"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                  />
                </div>
              </div>

<<<<<<< HEAD
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
=======
              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                >
                  Cancel
                </button>
                <button
                  type="submit"
<<<<<<< HEAD
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60 shadow-xs"
                >
                  {submitting
                    ? "Saving..."
                    : editingRoute
                      ? "Update Route"
                      : "Create Route"}
=======
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {editingRoute === 'new' ? 'Create Route' : 'Save Changes'}
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* Delete Confirmation Modal */}
      {deleteModalRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Delete Route</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete route <strong className="text-slate-900">{deleteModalRoute.firstPlace} ➔ {deleteModalRoute.lastPlace}</strong>? Customers will no longer be able to look up quotes for this route.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalRoute(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
              >
                Cancel
              </button>
              <button
<<<<<<< HEAD
                onClick={handleDelete}
                disabled={submitting}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Delete Route"}
=======
                onClick={handleDeleteRoute}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Delete Route
>>>>>>> 4ffe744f40dd7cd1a091d258cf3cf67c2bcdd2b1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
