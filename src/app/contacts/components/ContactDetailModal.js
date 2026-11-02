"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Save,
  Tag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ContactDetailModal({
  contact,
  onClose,
  onStatusUpdated,
  getStatusBadge,
}) {
  const [status, setStatus] = useState("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (contact) {
      setStatus(contact.status || "new");
      setAdminNotes(contact.adminNotes || "");
      setError(null);
      setSuccessMsg(null);
    }
  }, [contact]);

  if (!contact) return null;

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateContactStatus(contact._id, {
        status,
        adminNotes,
      });

      if (res.success) {
        setSuccessMsg("Enquiry updated successfully!");
        if (onStatusUpdated) {
          onStatusUpdated(res.data);
        }
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update contact enquiry status.");
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = contact.createdAt
    ? new Date(contact.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

  const formattedRespondedDate = contact.respondedAt
    ? new Date(contact.respondedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const mailtoLink = `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(
    `Re: ${contact.subject || "Enquiry"} - SYD Chauffeurs`,
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Contact Enquiry Details
              </h3>
              <p className="text-xs text-slate-500">ID: {contact._id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Information Card */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase">
                {contact.fullName ? contact.fullName.charAt(0) : "C"}
              </div>
              <span className="font-semibold text-slate-900 text-sm">
                {contact.fullName || "Anonymous Customer"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                  contact.status,
                )}`}
              >
                Current: {contact.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Email */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2 overflow-hidden">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={mailtoLink}
                  className="text-indigo-600 hover:underline font-medium truncate"
                  title="Send Email"
                >
                  {contact.email}
                </a>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer transition ml-1"
                title="Copy Email"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center bg-white p-2.5 rounded-lg border border-slate-200/60">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-slate-800 font-medium hover:text-indigo-600 truncate"
                >
                  {contact.phone}
                </a>
              ) : (
                <span className="text-slate-400 italic">Not provided</span>
              )}
            </div>

            {/* Received Date */}
            <div className="flex items-center bg-white p-2.5 rounded-lg border border-slate-200/60">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
              <span className="text-slate-600">
                Received:{" "}
                <b className="text-slate-800 font-medium">{formattedDate}</b>
              </span>
            </div>

            {/* Responded Date */}
            <div className="flex items-center bg-white p-2.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
              <span className="text-slate-600">
                Responded:{" "}
                <b className="text-slate-800 font-medium">
                  {formattedRespondedDate || "Not responded yet"}
                </b>
              </span>
            </div>
          </div>
        </div>

        {/* Subject & Message Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            Subject:{" "}
            <span className="text-slate-900 font-bold">
              {contact.subject || "General Enquiry"}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans selection:bg-indigo-100">
            {contact.message}
          </div>
        </div>

        {/* Quick Email Customer Action */}
        <div className="flex items-center justify-between p-3 bg-indigo-50/70 rounded-xl border border-indigo-100/80">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs font-bold text-indigo-950">
                Direct Email Response
              </p>
              <p className="text-[11px] text-indigo-700/80">
                Opens your default mail app addressed to {contact.email}
              </p>
            </div>
          </div>
          <a
            href={mailtoLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs"
          >
            Reply via Email
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Update Status & Notes Form */}
        <form
          onSubmit={handleSave}
          className="space-y-3 pt-2 border-t border-slate-100"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Enquiry Management & Dispatcher Notes
          </h4>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="contact-status-select"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Status
              </label>
              <select
                id="contact-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
              >
                <option value="new">New (Needs review)</option>
                <option value="in-progress">In Progress (Handling)</option>
                <option value="responded">Responded (Completed)</option>
                <option value="archived">Archived (Closed)</option>
              </select>
            </div>

            <div className="flex items-end">
              <p className="text-[11px] text-slate-400 pb-2">
                Setting to &quot;Responded&quot; automatically stamps the
                response time.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-admin-notes"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Internal Admin Notes
            </label>
            <textarea
              id="contact-admin-notes"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record follow-up calls, assigned chauffeur, quotation details, or special requests..."
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              {copied && "Email copied to clipboard!"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
