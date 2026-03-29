import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/router";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Role-based home routes
const ROLE_HOME = {
  user: "/user",
  shop: "/shop",
  admin: "/admin",
};

export const AuthProvider = ({ children, queryClient }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState(null);
  const isSigningOutRef = useRef(false);

  const generateSession = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return { ok: false };
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch("/api/auth/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create session" }));
        if (response.status === 403) {
          await signOut(auth);
          router.replace("/login");
          return { ok: false, error: errorData.error };
        }
        return { ok: false, error: errorData.error || response.statusText };
      }

      const data = await response.json();
      const role = data.role || "user";
      setUserRole(role);

      const redirectUrl =
        router.query.redirect && typeof router.query.redirect === "string"
          ? router.query.redirect
          : ROLE_HOME[role] || "/";
      router.push(redirectUrl);
      return { ok: true };
    } catch (error) {
      console.error("Error creating session:", error);
      return { ok: false, error: error?.message };
    }
  }, [router, queryClient]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    isSigningOutRef.current = true;
    try {
      if (queryClient) queryClient.clear();
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      setUserRole(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error.message);
      isSigningOutRef.current = false;
      setSigningOut(false);
    }
  }, [router, queryClient]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);

      if (router.pathname === "/login") {
        isSigningOutRef.current = false;
        setSigningOut(false);
      }

      if (!firebaseUser && !initializing && router.pathname !== "/login" && !isSigningOutRef.current) {
        handleSignOut();
      }
    });
    return unsubscribe;
  }, [router, initializing, handleSignOut]);

  // Fetch role on mount if user exists but role is unknown
  useEffect(() => {
    if (user && !userRole && !initializing) {
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data?.role) setUserRole(data.role); })
        .catch(() => {});
    }
  }, [user, userRole, initializing]);

  const handleGoogleSignIn = useCallback(async () => {
    setSigningIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const sessionResult = await generateSession(result.user);
      if (!sessionResult.ok) {
        setError(sessionResult.error || "Failed to sign in");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error.message);
    } finally {
      setSigningIn(false);
    }
  }, [generateSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        initializing,
        signingIn,
        signingOut,
        handleGoogleSignIn,
        handleSignOut,
        generateSession,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
