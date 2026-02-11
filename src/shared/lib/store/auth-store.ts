"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,
      
      setAccessToken: (accessToken) => {
        set({
          accessToken,
          isAuthenticated: true,
        });
      },
      
      clearAuth: () => {
        set({
          accessToken: null,
          isAuthenticated: false,
        });
      },
      
      checkAuth: () => {
        const { accessToken } = get();
        return !!accessToken;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
