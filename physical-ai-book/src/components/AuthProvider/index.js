import React, { createContext, useContext, useState, useEffect } from "react";
import { authClient } from "@site/src/lib/auth-client";

const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  authAvailable: true,
  showQuestionnaire: false,
  setShowQuestionnaire: () => {},
  refreshSession: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const refreshSession = async () => {
    try {
      const { data, error } = await authClient.getSession();
      if (error) {
        setUser(null);
        setSession(null);
      } else if (data) {
        setUser(data.user);
        setSession(data.session);
      }
      setAuthAvailable(true);
    } catch (err) {
      console.warn("Auth service unavailable:", err);
      setAuthAvailable(false);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setSession(null);
    } catch {
      // Clear local state even if server fails
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    authAvailable,
    showQuestionnaire,
    setShowQuestionnaire,
    refreshSession,
    signOut: handleSignOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
