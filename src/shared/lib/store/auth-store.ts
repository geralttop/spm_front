"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiUrl } from "../utils/api-url";
interface AuthState {
    accessToken: string | null;
    tokenExpiry: number | null;
    isAuthenticated: boolean;
    setAccessToken: (accessToken: string) => void;
    clearAuth: () => void;
    checkAuth: () => Promise<boolean>;
    isTokenExpired: () => boolean;
    shouldRefreshToken: () => boolean;
    initializeAuth: () => Promise<void>;
}
export const useAuthStore = create<AuthState>()(persist((set, get) => ({
    accessToken: null,
    tokenExpiry: null,
    isAuthenticated: false,
    setAccessToken: (accessToken) => {
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
        if (!accessToken) {
            return false;
        }
        if (!isTokenExpired()) {
            return true;
        }
        if (isTokenExpired() || shouldRefreshToken()) {
            try {
                const response = await fetch(`${getApiUrl()}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.accessToken) {
                        get().setAccessToken(data.accessToken);
                        return true;
                    }
                }
                get().clearAuth();
                return false;
            }
            catch (error) {
                console.error("Failed to refresh token in checkAuth:", error);
                get().clearAuth();
                return false;
            }
        }
        return false;
    },
    isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry)
            return true;
        return Date.now() >= tokenExpiry;
    },
    shouldRefreshToken: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry)
            return false;
        return Date.now() >= tokenExpiry - 5 * 60 * 1000;
    },
    initializeAuth: async () => {
        const { accessToken, isTokenExpired, shouldRefreshToken } = get();
        if (!accessToken || isTokenExpired() || shouldRefreshToken()) {
            try {
                const response = await fetch(`${getApiUrl()}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.accessToken) {
                        get().setAccessToken(data.accessToken);
                    }
                }
                else {
                    get().clearAuth();
                }
            }
            catch (error) {
                console.error("Failed to refresh token on init:", error);
                get().clearAuth();
            }
        }
    },
}), {
    name: "auth-storage",
}));
