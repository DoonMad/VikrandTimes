"use client";
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ user, children }: {
    user: User | null,
    children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}