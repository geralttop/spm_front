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

    // Если ошибка 401 и это не запрос на обновление токена
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

            // Пытаемся обновить токен (refresh token автоматически из cookie)
            if (accessToken) {
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
                  {}, // Пустое body - токен из cookie
                  {
                    withCredentials: true, // ВАЖНО: отправляет cookies
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const { accessToken: newAccessToken } = response.data;

                // Обновляем только access token в localStorage
                const updatedAuth = {
                  ...auth,
                  state: {
                    ...auth.state,
                    accessToken: newAccessToken,
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
              // Нет токена, перенаправляем на страницу аутентификации
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
