"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      setRole(data?.role ?? "user");
    } catch {
      setRole("user");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setSession(session);
    setUser(session.user);
    await fetchRole(session.user.id);
    setLoading(false);
  }, [fetchRole]);

  useEffect(() => {
    let mounted = true;

    // Initial session load
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      if (!session || event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setRole(null);
        setLoading(false);
        // ✅ Only navigate on explicit sign out, not on every state change
        if (event === "SIGNED_OUT") {
          router.replace("/login");
        }
      } else {
        setUser(session.user);
        setSession(session);
        await fetchRole(session.user.id);
        setLoading(false);
        // ✅ Only navigate on fresh sign in (OAuth callback, OTP verify, etc.)
        if (event === "SIGNED_IN") {
          // Let the LoginPage or individual pages handle their own routing
          // Do NOT call router.refresh() — it remounts components and kills dropdown state
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser, fetchRole, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will handle the redirect above
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}