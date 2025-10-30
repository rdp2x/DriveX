"use client";

import * as React from "react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);
  const [user, setUserState] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("drivex_token")
        : null;
    const u =
      typeof window !== "undefined"
        ? localStorage.getItem("drivex_user")
        : null;

    if (t) setTokenState(t);
    if (u) {
      try {
        setUserState(JSON.parse(u));
      } catch (e) {
        localStorage.removeItem("drivex_user");
      }
    }
    setIsLoading(false);
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (typeof window === "undefined") return;
    if (t) localStorage.setItem("drivex_token", t);
    else localStorage.removeItem("drivex_token");
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem("drivex_user", JSON.stringify(u));
    else localStorage.removeItem("drivex_user");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    token,
    user,
    setToken,
    setUser,
    logout,
    isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
