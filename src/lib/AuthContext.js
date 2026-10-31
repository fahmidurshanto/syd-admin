"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "./api";
import { bookingsCache, paymentsCache, routesCache } from "./dataCache";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth session by verifying HttpOnly cookie with /api/admin/me
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.admin) {
        setAdmin(res.admin);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const res = await api.login(credentials);
    if (res.admin) {
      setAdmin(res.admin);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      routesCache.clear();
      paymentsCache.clear();
      bookingsCache.clear();
      setAdmin(null);
    }
  };

  const isSuperAdmin = admin?.role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        admin,
        isSuperAdmin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
        refreshAdmin: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
