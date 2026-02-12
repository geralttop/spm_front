"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/lib/store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Инициализируем аутентификацию при загрузке приложения
    const init = async () => {
      try {
        // Убираем race condition - ждем полной инициализации
        await initializeAuth();
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    init();
  }, [initializeAuth]);

  // Показываем детей только после инициализации
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
