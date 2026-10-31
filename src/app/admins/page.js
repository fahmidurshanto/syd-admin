"use client";

import {
  AlertCircle,
  Edit,
  KeyRound,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import ScrollableTable from "@/components/ScrollableTable";
import { useSearchInput } from "@/hooks/useSearchInput";

const ADMIN_COLUMNS = [
  { label: "User Details" },
  { label: "Role" },
  { label: "Phone" },
  { label: "Status" },
  { label: "Last Login" },
  { label: "Actions", align: "right" },
];

export default function AdminsManagementPage() {
  const { isSuperAdmin, admin: currentAdmin, loading: authLoading } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    search,
    setSearch,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  } = useSearchInput();

  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [passwordModalAdmin, setPasswordModalAdmin] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    phone: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "admin",
    phone: "",
    isActive: true,
  });

  const [newPassword, setNewPassword] = useState("");

  const fetchAdmins = useCallback(
    async (searchTerm = debouncedSearch, filter = roleFilter) => {
      try {
        setLoading(true);
        setIsSearching(true);
        setError(null);
        const params = {};
        if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
        if (filter !== "all") params.role = filter;

        const res = await api.getAdmins(params);
        if (res.success) {
          setAdmins(res.admins || []);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to fetch admin users from /api/admin/admins.",
        );
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearch, roleFilter, setIsSearching]
  );

  useEffect(() => {
    if (!isSuperAdmin) return;
    let isCurrent = true;

    const performFetch = async () => {
      try {
        setLoading(true);
        setIsSearching(true);
        setError(null);
        const params = {};
        if (debouncedSearch && debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        if (roleFilter !== "all") {
          params.role = roleFilter;
        }

        const res = await api.getAdmins(params);
        if (isCurrent && res.success) {
          setAdmins(res.admins || []);
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setError(
            err.message || "Failed to fetch admin users from /api/admin/admins.",
          );
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
  }, [debouncedSearch, roleFilter, isSuperAdmin, setIsSearching]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createAdmin(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        phone: "",
      });
      await fetchAdmins();
    } catch (err) {
      alert(`Error creating admin: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name || "",
      email: admin.email || "",
      role: admin.role || "admin",
      phone: admin.phone || "",
      isActive: admin.isActive !== undefined ? admin.isActive : true,
    });
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      setSubmitting(true);
      const adminId = editingAdmin._id || editingAdmin.id;
      await api.updateAdmin(adminId, editForm);
      setEditingAdmin(null);
      await fetchAdmins();
    } catch (err) {
      alert(`Error updating admin: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalAdmin) return;
    try {
      setSubmitting(true);
      const adminId = passwordModalAdmin._id || passwordModalAdmin.id;
      await api.setAdminPassword(adminId, newPassword);
      setPasswordModalAdmin(null);
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (err) {
      alert(`Error updating password: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const adminId = deleteTarget._id || deleteTarget.id;
      await api.deleteAdmin(adminId);
      setDeleteTarget(null);
      await fetchAdmins();
    } catch (err) {
      alert(`Failed to delete admin: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalCount = admins.length;
  const superAdminCount = admins.filter((a) => a.role === "superadmin").length;
  const activeCount = admins.filter((a) => a.isActive).length;

  if (authLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Superadmin Access Required
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Admin Team management portal is restricted to users with the{" "}
            <b>superadmin</b> role. You are currently signed in as an{" "}
            <b>admin</b> ({currentAdmin?.email}).
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
            >
              Return to Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <PageHeader
        title="Admin Team Management"
        description="Configure administrator accounts, assign superadmin privileges, and manage security."
        icon={ShieldCheck}
        onRefresh={fetchAdmins}
        loading={loading}
        actions={
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Administrator
          </button>
        }
      />

      {/* Role notice if not superadmin */}
      {!isSuperAdmin && currentAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Notice: Superadmin Privileges Required for Modifications
            </p>
            <p className="mt-0.5 text-amber-700">
              You are currently authenticated as an <b>Admin</b>. Creating,
              editing, and deleting admin accounts requires <b>superadmin</b>{" "}
              role on the backend.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Administrators
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Registered staff members
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Superadmins
          </span>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {superAdminCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            With full administrative privileges
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Status
          </span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {activeCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Authorized for portal access
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={clear}
          isLoading={isSearching}
          placeholder="Search by name or email..."
          className="w-full sm:flex-1 sm:max-w-md"
        />

        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          {isSearching && (
            <span className="text-xs text-indigo-600 font-medium animate-pulse">
              Searching...
            </span>
          )}
          <label className="text-xs font-medium text-slate-500 shrink-0">
            Filter Role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Admins Table */}
      <ScrollableTable
        columns={ADMIN_COLUMNS}
        loading={loading}
        isSearching={isSearching}
        isEmpty={admins.length === 0}
        maxHeight="max-h-[calc(100vh-420px)]"
        minHeight="min-h-[300px]"
        loadingMessage="Loading administrators from backend..."
        emptyContent={
          debouncedSearch ? (
            <div>
              <p>No administrators found matching "{debouncedSearch}".</p>
              <button
                type="button"
                onClick={clear}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          ) : (
            "No administrators found. Please sign in or check server connection."
          )
        }
      >
        {admins.map((adm) => {
          const isCurrent = currentAdmin?.email === adm.email;
          return (
            <tr
              key={adm._id || adm.id}
              className="hover:bg-slate-50/80 transition-colors"
            >
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {adm.name ? adm.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">
                        {adm.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {adm.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    adm.role === "superadmin"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {adm.role}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-600">
                {adm.phone || "-"}
              </td>
              <td className="py-3.5 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    adm.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {adm.isActive ? "Active" : "Deactivated"}
                </span>
              </td>
              <td className="py-3.5 px-4 text-slate-500">
                {adm.lastLoginAt
                  ? new Date(adm.lastLoginAt).toLocaleString()
                  : "Never"}
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEditModal(adm)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Edit Admin"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPasswordModalAdmin(adm)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
                    title="Set Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(adm)}
                    disabled={isCurrent}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Delete Admin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </ScrollableTable>

      {/* Modal: Create Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Add New Administrator
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="sarah@sydtransport.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    placeholder="+61 400 000 000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60 shadow-xs"
                >
                  {submitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Admin */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" />
                Edit Administrator: {editingAdmin.name}
              </h3>
              <button
                onClick={() => setEditingAdmin(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label
                  htmlFor="editIsActive"
                  className="font-semibold text-slate-700 select-none"
                >
                  Account is Active
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60 shadow-xs"
                >
                  {submitting ? "Saving..." : "Update Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Set Password */}
      {passwordModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Change Password
              </h3>
              <button
                onClick={() => setPasswordModalAdmin(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Setting new password for <b>{passwordModalAdmin.name}</b> (
              {passwordModalAdmin.email})
            </p>

            <form onSubmit={handleSetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalAdmin(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-60"
                >
                  {submitting ? "Setting..." : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              Delete Administrator?
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <b>{deleteTarget.name}</b> (
              {deleteTarget.email})? They will immediately lose access to the
              admin dashboard.
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
                {submitting ? "Deleting..." : "Delete Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
