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

// Интерцептор для добавления токена и проактивного обновления
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const auth = JSON.parse(authStorage);
          const accessToken = auth?.state?.accessToken;
          const tokenExpiry = auth?.state?.tokenExpiry;
          
          if (accessToken) {
            // Проверяем, нужно ли обновить токен (за 2 минуты до истечения)
            const shouldRefresh = tokenExpiry && Date.now() >= tokenExpiry - 2 * 60 * 1000;
            
            if (shouldRefresh && !config.url?.includes("/auth/refresh") && !isRefreshing) {
              isRefreshing = true;
              
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
                  {},
                  {
                    withCredentials: true,
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const { accessToken: newAccessToken } = response.data;
                const newExpiry = Date.now() + 15 * 60 * 1000;

                // Обновляем токен в localStorage
                const updatedAuth = {
                  ...auth,
                  state: {
                    ...auth.state,
                    accessToken: newAccessToken,
                    tokenExpiry: newExpiry,
                    isAuthenticated: true,
                  },
                };
                localStorage.setItem("auth-storage", JSON.stringify(updatedAuth));

                config.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
              } catch (error) {
                console.error("Proactive token refresh failed:", error);
                processQueue(error, null);
                localStorage.removeItem("auth-storage");
                // Не редиректим здесь - позволяем запросу пройти и обработаться в response interceptor
              } finally {
                isRefreshing = false;
              }
            } else {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
        }
      }
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

    // Если ошибка 401 и это не запрос на обновление токена
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
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

      if (typeof window !== "undefined") {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          try {
            const auth = JSON.parse(authStorage);
            const accessToken = auth?.state?.accessToken;

            if (accessToken) {
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
                  {},
                  {
                    withCredentials: true,
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const { accessToken: newAccessToken } = response.data;
                const newExpiry = Date.now() + 15 * 60 * 1000;

                // Обновляем токен в localStorage
                const updatedAuth = {
                  ...auth,
                  state: {
                    ...auth.state,
                    accessToken: newAccessToken,
                    tokenExpiry: newExpiry,
                    isAuthenticated: true,
                  },
                };
                localStorage.setItem("auth-storage", JSON.stringify(updatedAuth));

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                isRefreshing = false;
                
                return apiClient(originalRequest);
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem("auth-storage");
                
                // Более мягкий подход - не редиректим сразу, позволяем компоненту обработать ошибку
                return Promise.reject(refreshError);
              }
            } else {
              isRefreshing = false;
              localStorage.removeItem("auth-storage");
              return Promise.reject(new Error("No access token available"));
            }
          } catch (parseError) {
            console.error("Error parsing auth storage:", parseError);
            isRefreshing = false;
            localStorage.removeItem("auth-storage");
            return Promise.reject(parseError);
          }
        } else {
          isRefreshing = false;
          return Promise.reject(new Error("No auth storage found"));
        }
      }
    }

    return Promise.reject(error);
  }
);

