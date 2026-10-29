"use client";

import { Search, RefreshCw, X } from "lucide-react";

/**
 * Reusable search input with real-time loading spinner and quick-clear button.
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Search...",
  className = "w-full md:w-96",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-xs transition"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={onClear || (() => onChange(""))}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
