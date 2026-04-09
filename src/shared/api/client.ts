import axios from "axios";
import { getApiUrl } from "../lib/utils/api-url";
export const apiClient = axios.create({
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
apiClient.interceptors.request.use((config) => {
    if (config.url?.startsWith('http')) {
        return config;
    }
    config.baseURL = getApiUrl();
    return config;
}, (error) => Promise.reject(error));
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
const getAccessToken = () => {
    if (typeof window === "undefined")
        return null;
    try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            const auth = JSON.parse(authStorage);
            const token = auth?.state?.accessToken || null;
            return token;
        }
    }
    catch {
    }
    return null;
};
const updateAccessToken = (newToken: string) => {
    if (typeof window === "undefined")
        return;
    try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            const auth = JSON.parse(authStorage);
            const newExpiry = Date.now() + 15 * 60 * 1000;
            const updatedAuth = {
                ...auth,
                state: {
                    ...auth.state,
                    accessToken: newToken,
                    tokenExpiry: newExpiry,
                    isAuthenticated: true,
                },
            };
            localStorage.setItem("auth-storage", JSON.stringify(updatedAuth));
        }
    }
    catch {
    }
};
const clearAuthStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
    }
};
apiClient.interceptors.request.use(async (config) => {
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
const isAuthEndpoint = (url: string = '') => /\/auth\/(login|register|verify-email|verify-login|forgot-password|reset-password)/.test(url);
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? '';
    if (error.response?.status === 401 && isAuthEndpoint(requestUrl)) {
        return Promise.reject(error);
    }
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !requestUrl.includes("/auth/refresh") &&
        !requestUrl.includes("refresh")) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            })
                .catch((err) => {
                return Promise.reject(err);
            });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        const accessToken = getAccessToken();
        if (accessToken) {
            try {
                const response = await axios.post(`${getApiUrl()}/auth/refresh`, {}, {
                    withCredentials: true,
                });
                const { accessToken: newAccessToken } = response.data;
                updateAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                isRefreshing = false;
                return apiClient(originalRequest);
            }
            catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                clearAuthStorage();
                return Promise.reject(refreshError);
            }
        }
        else {
            isRefreshing = false;
            clearAuthStorage();
            return Promise.reject(new Error("No access token available"));
        }
    }
    return Promise.reject(error);
});
