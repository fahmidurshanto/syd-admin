'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Route, 
  CreditCard, 
  Car,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Bookings', href: '/bookings', icon: CalendarDays },
    { label: 'Routes & Fares', href: '/routes', icon: Route },
    { label: 'Payments', href: '/payments', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 min-h-screen text-slate-600 shadow-sm">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200 bg-white">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-bold text-lg">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight text-base leading-tight">SYD Admin</h1>
          <p className="text-[11px] text-slate-500 font-medium">Chauffeur & Fleet</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs border border-indigo-100' 
                  : 'hover:bg-slate-100/80 hover:text-slate-900 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold">
            Live
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate">Backend Connected</p>
            <p className="text-[10px] text-slate-500 truncate">localhost:5000</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
