"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { getSupabaseClient } from "@/lib/supabase/client"; // ✅ Updated import
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
  
  // ✅ Stable singleton initialized directly, no useRef wrapper needed
  const supabase = getSupabaseClient(); 

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
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ getUser() re-validates with server, getSession() can be stale
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setUser(null);
        setSession(null);
        setRole(null);
        return;
      }

      // Get session separately for the session object
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(user);
      await fetchRole(user.id);
    } catch (err) {
      console.error("Auth refresh error:", err);
      setUser(null);
      setSession(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, fetchRole]);

  useEffect(() => {
    let mounted = true;

    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        if (!session || event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          setRole(null);
          setLoading(false);
          if (event === "SIGNED_OUT") {
            router.replace("/login");
          }
        } else {
          setUser(session.user);
          setSession(session);
          await fetchRole(session.user.id);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser, fetchRole, router, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange handles the redirect
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}