"use client";

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ScrollableTable from "@/components/ScrollableTable";
import SearchInput from "@/components/SearchInput";
import { useSearchInput } from "@/hooks/useSearchInput";
import { api } from "@/lib/api";
import { contactsCache } from "@/lib/dataCache";
import ContactDetailModal from "./components/ContactDetailModal";
import DeleteContactModal from "./components/DeleteContactModal";

const CONTACT_COLUMNS = [
  { label: "Customer" },
  { label: "Subject & Message" },
  { label: "Status" },
  { label: "Received Date" },
  { label: "Actions", align: "right" },
];

const getCacheKey = (status, search, page) =>
  `${status || "all"}__${(search || "").trim().toLowerCase()}__${page || 1}`;

export default function ContactsManagementPage() {
  const [contacts, setContacts] = useState(
    () => contactsCache.get("default")?.contacts || [],
  );
  const [totalCount, setTotalCount] = useState(
    () => contactsCache.get("default")?.total || 0,
  );
  const [totalPages, setTotalPages] = useState(
    () => contactsCache.get("default")?.pages || 1,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(() => !contactsCache.has("default"));
  const [error, setError] = useState(null);

  // Search & Filters
  const {
    search,
    setSearch,
    debouncedSearch,
    isSearching,
    setIsSearching,
    clear,
  } = useSearchInput();

  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quickUpdatingId, setQuickUpdatingId] = useState(null);

  // Fetch contacts from server
  const fetchContacts = useCallback(
    async (
      searchTerm = debouncedSearch,
      filt = statusFilter,
      pg = currentPage,
      force = false,
    ) => {
      const term =
        typeof searchTerm === "string" ? searchTerm : debouncedSearch;
      const statusVal = typeof filt === "string" ? filt : statusFilter;
      const pageNum = typeof pg === "number" ? pg : currentPage;
      const shouldForce = force === true;
      const isDefault = !term?.trim() && statusVal === "all" && pageNum === 1;
      const cacheKey = isDefault
        ? "default"
        : getCacheKey(statusVal, term, pageNum);

      if (!shouldForce && contactsCache.has(cacheKey)) {
        const cached = contactsCache.get(cacheKey);
        setContacts(cached.contacts || []);
        setTotalCount(cached.total || 0);
        setTotalPages(cached.pages || 1);
        setLoading(false);
        setIsSearching(false);
        return;
      }

      try {
        if (shouldForce || !contactsCache.has("default")) {
          setLoading(true);
        }
        setIsSearching(true);
        setError(null);

        const params = {
          page: pageNum,
          limit: 15,
        };
        if (term?.trim()) {
          params.search = term.trim();
        }
        if (statusVal !== "all") {
          params.status = statusVal;
        }

        const res = await api.getContacts(params);
        if (res.success) {
          const list = res.data || [];
          const count = res.total || 0;
          const pages = res.pages || 1;
          const cacheData = { contacts: list, total: count, pages };

          contactsCache.set(cacheKey, cacheData);
          if (isDefault) {
            contactsCache.set("default", cacheData);
          }

          setContacts(list);
          setTotalCount(count);
          setTotalPages(pages);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch contact enquiries.");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [debouncedSearch, statusFilter, currentPage, setIsSearching],
  );

  // Trigger fetch when filters, debounced search, or page changes
  useEffect(() => {
    fetchContacts(debouncedSearch, statusFilter, currentPage);
  }, [fetchContacts, debouncedSearch, statusFilter, currentPage]);

  // Turn off searching spinner when debounced value updates
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setIsSearching(false);
    }
  }, [debouncedSearch, setIsSearching]);

  // Quick Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "responded":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "archived":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Handle Quick Status Change from Row Dropdown
  const handleQuickStatusChange = async (contactId, newStatus) => {
    try {
      setQuickUpdatingId(contactId);
      const res = await api.updateContactStatus(contactId, {
        status: newStatus,
      });
      if (res.success) {
        // Update local list
        setContacts((prev) =>
          prev.map((c) => (c._id === contactId ? res.data : c)),
        );
        contactsCache.clear();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update status.");
    } finally {
      setQuickUpdatingId(null);
    }
  };

  // Handle Contact Updated from Modal
  const handleContactUpdated = (updatedContact) => {
    setContacts((prev) =>
      prev.map((c) => (c._id === updatedContact._id ? updatedContact : c)),
    );
    setSelectedContact(updatedContact);
    contactsCache.clear();
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async (contactId) => {
    try {
      setIsDeleting(true);
      const res = await api.deleteContact(contactId);
      if (res.success) {
        setContacts((prev) => prev.filter((c) => c._id !== contactId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setDeleteTarget(null);
        contactsCache.clear();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete contact enquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick stats computed from current contacts
  const newCount = contacts.filter((c) => c.status === "new").length;
  const inProgressCount = contacts.filter(
    (c) => c.status === "in-progress",
  ).length;
  const respondedCount = contacts.filter(
    (c) => c.status === "responded",
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Contact Enquiries"
        description="Monitor, review, and respond to incoming customer messages, quotes, and queries."
        icon={Mail}
        onRefresh={() => {
          contactsCache.clear();
          fetchContacts(debouncedSearch, statusFilter, currentPage, true);
        }}
        loading={loading}
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Enquiries
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {totalCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        {/* New / Action Required */}
        <div className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-full blur-xl -mr-4 -mt-4 pointer-events-none" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                New (Unread)
              </p>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-0.5">
              {newCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              In Progress
            </p>
            <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-0.5">
              {inProgressCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Responded */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Responded
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-900 mt-0.5">
              {respondedCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Enquiries" },
            { id: "new", label: "New" },
            { id: "in-progress", label: "In Progress" },
            { id: "responded", label: "Responded" },
            { id: "archived", label: "Archived" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          onClear={() => {
            clear();
            setCurrentPage(1);
          }}
          isLoading={isSearching}
          placeholder="Search by name, email, phone, subject..."
          className="w-full lg:w-80"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scrollable Table */}
      <ScrollableTable
        columns={CONTACT_COLUMNS}
        loading={loading}
        isSearching={isSearching}
        isEmpty={contacts.length === 0}
        emptyContent={
          <div className="py-14 text-center">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-semibold text-sm">
              No contact enquiries found
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {search || statusFilter !== "all"
                ? "Try clearing your search or filters to see more results."
                : "Customer contact form submissions will appear here."}
            </p>
          </div>
        }
      >
        {contacts.map((c) => {
          const dateStr = c.createdAt
            ? new Date(c.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "-";
          const timeStr = c.createdAt
            ? new Date(c.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <tr
              key={c._id}
              className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
              onClick={() => setSelectedContact(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedContact(c);
                }
              }}
              tabIndex={0}
            >
              {/* Customer */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {c.fullName ? c.fullName.charAt(0) : "C"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {c.fullName || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] truncate">
                      <span className="truncate">{c.email}</span>
                      {c.phone && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{c.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* Subject & Preview */}
              <td className="py-3 px-4 max-w-xs">
                <p className="font-medium text-slate-900 truncate">
                  {c.subject || "General Enquiry"}
                </p>
                <p className="text-slate-500 text-[11px] truncate">
                  {c.message}
                </p>
              </td>

              {/* Status & Quick Status Picker */}
              <td className="py-3 px-4 whitespace-nowrap">
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <select
                    aria-label="Update enquiry status"
                    value={c.status}
                    disabled={quickUpdatingId === c._id}
                    onChange={(e) =>
                      handleQuickStatusChange(c._id, e.target.value)
                    }
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-2xs focus:outline-none cursor-pointer transition ${getStatusBadge(
                      c.status,
                    )} ${
                      quickUpdatingId === c._id
                        ? "opacity-50 animate-pulse"
                        : ""
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </td>

              {/* Received Date */}
              <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                <div className="flex flex-col text-[11px]">
                  <span className="font-medium text-slate-800">{dateStr}</span>
                  <span className="text-slate-400">{timeStr}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {/* View Details */}
                  <button
                    type="button"
                    onClick={() => setSelectedContact(c)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    title="View Full Enquiry"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Mail customer */}
                  <a
                    href={`mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(
                      `Re: ${c.subject || "Enquiry"} - SYD Chauffeurs`,
                    )}`}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    title="Email Customer Directly"
                  >
                    <Mail className="w-4 h-4" />
                  </a>

                  {/* Delete Enquiry */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </ScrollableTable>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          <p className="text-slate-500">
            Showing page{" "}
            <strong className="text-slate-800">{currentPage}</strong> of{" "}
            <strong className="text-slate-800">{totalPages}</strong> (
            {totalCount} total enquiries)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ContactDetailModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onStatusUpdated={handleContactUpdated}
        getStatusBadge={getStatusBadge}
      />

      <DeleteContactModal
        contact={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
