import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "./api";
import type { Role, User } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role: "ngo" | "volunteer";
    organization?: string;
    location?: string;
    skills?: string[];
    categories?: string[];
  }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function getRoleHome(role?: Role) {
  if (role === "volunteer") return "/volunteer";
  return "/admin";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await api.me();
        if (!cancelled) setUser(result.user);
      } catch (err) {
        clearStoredToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Session expired.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login: async (email, password) => {
        setError(null);
        const result = await api.login(email, password);
        setStoredToken(result.token);
        setUser(result.user);
        return result.user;
      },
      signup: async (payload) => {
        setError(null);
        const result = await api.signup(payload);
        setStoredToken(result.token);
        setUser(result.user);
        return result.user;
      },
      logout: () => {
        clearStoredToken();
        setUser(null);
      },
    }),
    [error, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
