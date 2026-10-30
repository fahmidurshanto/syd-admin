"use client";

import {
  CalendarDays,
  Car,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Route,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, isAuthenticated, logout, isSuperAdmin } = useAuth();

  const navItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Bookings", href: "/bookings", icon: CalendarDays },
    { label: "Routes & Fares", href: "/routes", icon: Route },
    { label: "Payments", href: "/payments", icon: CreditCard },
    {
      label: "Admin Team",
      href: "/admins",
      icon: ShieldCheck,
      superAdminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 min-h-screen text-slate-600 shadow-sm">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200 bg-white">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-bold text-lg">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight text-base leading-tight">
            SYD Admin
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Chauffeur & Fleet
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Main Menu
        </p>
        {navItems
          .filter((item) => !item.superAdminOnly || isSuperAdmin)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs border border-indigo-100"
                    : "hover:bg-slate-100/80 hover:text-slate-900 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-500"}`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.href === "/admins" && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded-md">
                      Admin API
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>
              </Link>
            );
          })}
      </div>

      {/* Auth & Session Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
        {isAuthenticated && admin ? (
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
                  {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="truncate max-w-[110px]">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {admin.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {admin.email}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  admin.role === "superadmin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {admin.role === "superadmin" ? "Super" : "Admin"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors border border-rose-200/60 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-600 font-medium">
                Not authenticated
              </p>
            </div>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In to Admin
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-slate-500 font-medium">
            Backend /api/admin Connected
          </span>
        </div>
      </div>
    </aside>
  );
}
