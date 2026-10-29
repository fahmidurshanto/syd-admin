"use client";

import { RefreshCw } from "lucide-react";

/**
 * Standard Page Header for admin pages with icon, title, description,
 * refresh button (with spinner), and optional custom action buttons.
 */
export default function PageHeader({
  title,
  description,
  icon: Icon,
  onRefresh,
  loading = false,
  actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
            />
            Refresh
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
