"use client";

import { RefreshCw } from "lucide-react";

/**
 * Reusable Scrollable Table component:
 * - Fixed Y-axis scroll with custom max/min heights
 * - Sticky <thead> pinned to the top with matching background
 * - Built-in initial loading state, search dimming feedback, top progress line, and empty state
 */
export default function ScrollableTable({
  columns = [],
  loading = false,
  isSearching = false,
  isEmpty = false,
  emptyContent,
  loadingMessage = "Loading data...",
  maxHeight = "max-h-[calc(100vh-280px)]",
  minHeight = "min-h-[350px]",
  children,
}) {
  const colCount = columns.length || 1;
  const isBusy = loading || isSearching;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col relative">
      {/* Subtle animated progress bar across the top of table during background operations */}
      {isBusy && !isEmpty && (
        <div className="h-0.5 w-full bg-indigo-100 overflow-hidden absolute top-0 left-0 right-0 z-20">
          <div className="h-full bg-indigo-600 animate-pulse w-full" />
        </div>
      )}

      <div
        className={`overflow-x-auto overflow-y-auto  ${maxHeight} ${minHeight}`}
      >
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-xs">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`py-3.5 px-4 bg-slate-50 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-slate-100 text-xs transition-opacity duration-150 ${
              isBusy ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {loading && isEmpty ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="py-14 text-center text-slate-400 font-medium"
                >
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2.5 text-indigo-500" />
                  {loadingMessage}
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="py-14 text-center text-slate-400 font-medium"
                >
                  {emptyContent || "No records found."}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
