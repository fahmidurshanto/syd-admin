"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace("/login");
      } else if (isAuthenticated && isLoginPage) {
        router.replace("/");
      }
    }
  }, [isAuthenticated, loading, isLoginPage, router]);

  // Automatically close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // If on login page, don't show sidebar and take full screen
  if (isLoginPage) {
    return (
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
        <main className="flex-1 flex items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  // While checking auth status
  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Loading admin session...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated and not on login page, wait for redirect
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated admin view
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-slate-50">
        {/* Top Mobile Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              SYD Admin
            </span>
          </div>
          <div className="w-8" />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-5 px-4 sm:px-6 md:py-8 lg:px-0 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
