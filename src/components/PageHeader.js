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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 sm:gap-2.5">
          {Icon && (
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
          )}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap self-start sm:self-auto">
        {onRefresh && (
          <button
            type="button"
            onClick={() => onRefresh?.()}
            disabled={loading}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-300 text-[11px] sm:text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
            />
            Refresh
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}
