import axios from "axios";

/**
 * Базовый клиент для API запросов
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // ВАЖНО: отправляет cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Функция для получения токена из Zustand store
const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const auth = JSON.parse(authStorage);
      const token = auth?.state?.accessToken || null;
      console.log('🔑 Getting access token:', token ? 'EXISTS' : 'MISSING');
      return token;
    }
  } catch (error) {
    console.error("Error getting access token:", error);
  }
  return null;
};

// Функция для обновления токена в Zustand store
const updateAccessToken = (newToken: string) => {
  if (typeof window === "undefined") return;
  
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
      console.log('✅ Access token updated in storage');
    }
  } catch (error) {
    console.error("Error updating access token:", error);
  }
};

// Функция для очистки auth storage
const clearAuthStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-storage");
    console.log('🗑️ Auth storage cleared');
  }
};

// Интерцептор для добавления токена
apiClient.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('🔍 Interceptor triggered:', {
      status: error.response?.status,
      url: originalRequest.url,
      fullUrl: originalRequest.baseURL + originalRequest.url,
      isRefreshUrl: originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("refresh"),
      hasRetry: originalRequest._retry
    });

    // Если ошибка 401 и это не запрос на обновление токена
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("refresh")
    ) {
      console.log('🔄 Starting token refresh process...');
      
      if (isRefreshing) {
        console.log('⏳ Already refreshing, adding to queue...');
        // Если уже идет обновление, добавляем запрос в очередь
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
      console.log('🔑 Current access token:', accessToken ? 'EXISTS' : 'MISSING');
      
      if (accessToken) {
        try {
          console.log('🔄 Making refresh request...');
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
            {},
            {
              withCredentials: true,
              // НЕ отправляем Authorization заголовок для refresh запроса
              // Refresh token передается через httpOnly cookie
            }
          );

          console.log('✅ Refresh successful:', response.status);
          const { accessToken: newAccessToken } = response.data;
          updateAccessToken(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          console.log('🔄 Retrying original request...');
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
          clearAuthStorage();
          
          return Promise.reject(refreshError);
        }
      } else {
        console.log('❌ No access token available');
        isRefreshing = false;
        clearAuthStorage();
        return Promise.reject(new Error("No access token available"));
      }
    }

    return Promise.reject(error);
  }
);

