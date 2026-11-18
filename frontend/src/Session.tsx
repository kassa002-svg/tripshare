import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../../backend/models/User";
import { API_BASE } from "@/apiBase";

type SessionUser = Omit<User, "passwordHash" | "googleId">;
const authUrl = `${API_BASE}/api/auth`;

const SessionContext = createContext({
  user: null as SessionUser | null,
  loading: true,
  error: "",
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${authUrl}/me`, { credentials: "include" })
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(data => setUser(data.user))
      .catch(() => setError("Could not load your session."))
      .finally(() => setLoading(false));
  }, []);

  async function signOut() {
    try {
      const response = await fetch(`${authUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setUser(null);
      setError("");
    } catch {
      setError("Could not sign out. Please try again.");
    }
  }

  return (
    <SessionContext.Provider value={{ user, loading, error, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
