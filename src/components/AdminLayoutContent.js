"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

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
          <p className="text-xs font-medium text-slate-500">Loading admin session...</p>
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
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        <main className="flex-1 py-6 md:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}
