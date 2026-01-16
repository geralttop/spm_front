import axios from "axios";

/**
 * Базовый клиент для API запросов
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для добавления токена в запросы
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const auth = JSON.parse(authStorage);
          const accessToken = auth?.state?.accessToken;
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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

// Интерцептор для обработки ошибок и обновления токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена или профиля
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          try {
            const auth = JSON.parse(authStorage);
            const accessToken = auth?.state?.accessToken;
            const refreshToken = auth?.state?.refreshToken;

            // Пытаемся обновить токен только если есть оба токена
            if (accessToken && refreshToken) {
              try {
                // Refresh endpoint требует access token в заголовке
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
                  { refreshToken },
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                  response.data;

                // Обновляем токены в localStorage
                const updatedAuth = {
                  ...auth,
                  state: {
                    ...auth.state,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    isAuthenticated: true,
                  },
                };
                localStorage.setItem("auth-storage", JSON.stringify(updatedAuth));

                // Повторяем оригинальный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
              } catch (refreshError) {
                // Если обновление токена не удалось, очищаем хранилище
                localStorage.removeItem("auth-storage");
                if (window.location.pathname !== "/auth") {
                  window.location.href = "/auth";
                }
                return Promise.reject(refreshError);
              }
            } else {
              // Нет токенов, перенаправляем на страницу аутентификации
              localStorage.removeItem("auth-storage");
              if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
              }
            }
          } catch (parseError) {
            console.error("Error parsing auth storage:", parseError);
            localStorage.removeItem("auth-storage");
            if (window.location.pathname !== "/auth") {
              window.location.href = "/auth";
            }
          }
        } else {
          // Нет хранилища, перенаправляем на страницу аутентификации
          if (window.location.pathname !== "/auth") {
            window.location.href = "/auth";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);
