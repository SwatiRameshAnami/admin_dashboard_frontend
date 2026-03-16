import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

// ── Hardcoded single admin (frontend only mode)
// When backend is ready, replace login() with a real API call
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin@123";

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);   // JWT from backend later
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError("");

    // ── FRONTEND-ONLY MODE ──
    // Simulate a small delay like a real API call
    await new Promise(r => setTimeout(r, 700));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Mock token — replace with real JWT when backend is ready
      const mockToken = btoa(JSON.stringify({ username, role: "ADMIN", exp: Date.now() + 86400000 }));
      setToken(mockToken);
      setAdmin({ username, role: "ADMIN" });
      setLoading(false);
      return true;
    } else {
      setError("Invalid username or password");
      setLoading(false);
      return false;
    }

    // ── BACKEND MODE (uncomment when Spring Boot is ready) ──
    // try {
    //   const res = await fetch("/api/auth/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ username, password }),
    //   });
    //   if (!res.ok) throw new Error("Invalid credentials");
    //   const data = await res.json();
    //   setToken(data.token);
    //   setAdmin({ username, role: "ADMIN" });
    //   setLoading(false);
    //   return true;
    // } catch (e) {
    //   setError(e.message);
    //   setLoading(false);
    //   return false;
    // }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    setError("");
  }, []);

  return (
    <AuthContext.Provider value={{ token, admin, loading, error, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
