"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiUrl } from "../utils/api-url";

interface AuthState {
  accessToken: string | null;
  tokenExpiry: number | null; // timestamp когда токен истекает
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
      
      setAccessToken: (accessToken) => {
        // Access token живет 15 минут
        const expiry = Date.now() + 15 * 60 * 1000;
        set({
          accessToken,
          tokenExpiry: expiry,
          isAuthenticated: true,
        });
      },
      
      clearAuth: () => {
        set({
          accessToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
        });
      },
      
      checkAuth: async () => {
        const { accessToken, isTokenExpired, shouldRefreshToken } = get();
        
        // Если токена нет, сразу возвращаем false
        if (!accessToken) {
          return false;
        }
        
        // Если токен не истек, возвращаем true
        if (!isTokenExpired()) {
          return true;
        }
        
        // Если токен истек или нужно обновить, пытаемся обновить
        if (isTokenExpired() || shouldRefreshToken()) {
          try {
            const response = await fetch(
              `${getApiUrl()}/auth/refresh`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.accessToken) {
                get().setAccessToken(data.accessToken);
                return true;
              }
            }
            
            // Если refresh не удался, очищаем auth
            get().clearAuth();
            return false;
          } catch (error) {
            console.error("Failed to refresh token in checkAuth:", error);
            get().clearAuth();
            return false;
          }
        }
        
        return false;
      },

      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return Date.now() >= tokenExpiry;
      },

      shouldRefreshToken: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return false;
        // Обновляем токен за 5 минут до истечения
        return Date.now() >= tokenExpiry - 5 * 60 * 1000;
      },

      initializeAuth: async () => {
        const { accessToken, isTokenExpired, shouldRefreshToken } = get();
        
        // Если токена нет или он истек, пытаемся обновить через refresh token
        if (!accessToken || isTokenExpired() || shouldRefreshToken()) {
          try {
            const response = await fetch(
              `${getApiUrl()}/auth/refresh`,
              {
                method: "POST",
                credentials: "include", // Отправляет httpOnly cookie
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.accessToken) {
                get().setAccessToken(data.accessToken);
              }
            } else {
              // Если refresh не удался, очищаем auth
              get().clearAuth();
            }
          } catch (error) {
            console.error("Failed to refresh token on init:", error);
            get().clearAuth();
          }
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
