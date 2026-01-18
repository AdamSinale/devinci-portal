import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "./api/auth";

type AuthState = {
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

const LS_KEY = "devinci_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    login: (u) => {
      setUser(u);
      localStorage.setItem(LS_KEY, JSON.stringify(u));
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem(LS_KEY);
    },
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
