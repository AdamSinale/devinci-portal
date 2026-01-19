import React, { 
  createContext, 
  useContext, 
  useEffect,      // runs code after render, if dependencies changed 
  useMemo,        // dont create new object each render unless dependencies change
  useState 
} from "react";
import type { LoginResult } from "./api/auth";
import { logout as apiLogout } from "./api/auth";

type AuthState = {             // interface for auth context
  user: LoginResult | null;         // current user or null if not logged in
  login: (u: LoginResult) => void;  // log in a user
  logout: () => void;          // log out the current user
};

const AuthCtx = createContext<AuthState | null>(null);  // create context for auth, 

const LS_USER = "devinci_auth_user";                     // local storage key for authed user (saved when refreshing)

export function AuthProvider({ children }: { children: React.ReactNode }) {  // wraps App
  const [user, setUser] = useState<LoginResult|null>(null);  // state for current user (starts null)

  useEffect(() => {                                      // runs after first render (because deps always [])
    const raw = localStorage.getItem(LS_USER);           // get user from local storage
    if (!raw) return;                                    // if none, do nothing
    try {
      setUser(JSON.parse(raw));                          // try setting current user to saved user
    } catch {
      localStorage.removeItem(LS_USER);                  // if error, remove invalid data
    }
  }, []);

  const value = useMemo<AuthState>(() => ({              // gets memoized auth context value
    user,                                                // puts current user in context
    login: (u) => {                                      // login function
      setUser(u);                                        // sets current user
      localStorage.setItem(LS_USER, JSON.stringify(u));  // saves to local storage
    },
    logout: () => {                                      // logout function
      setUser(null);                                     // clears current user
      localStorage.removeItem(LS_USER);                  // removes from local storage
      apiLogout();                                       // deletes access token
    },
  }), [user]);
  // provides auth context to children. user/login/logout called with useAuth()
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);  // reads auth context
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");  // error if no context in parent
  return ctx;                       // return auth context = { user, login, logout }
}
