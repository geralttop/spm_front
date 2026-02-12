"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "@/shared/config/i18n";
import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthInitializer } from "./auth-initializer";

/**
 * Провайдеры приложения (FSD App Layer)
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
