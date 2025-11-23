"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signOut as amplifySignOut } from "aws-amplify/auth";
import outputs from "../../amplify_outputs.json";

// Create the Auth Context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});

// Custom hook to use the Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Amplify on mount
  useEffect(() => {
    Amplify.configure(outputs, { ssr: true });
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut: handleSignOut,
    refreshAuth: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
