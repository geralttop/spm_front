"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import "@/shared/config/i18n";
import { LanguageProvider } from "./language-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthInitializer } from "./auth-initializer";
export function AppProviders({ children }: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                gcTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    }));
    return (<QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </LanguageProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && (<ReactQueryDevtools initialIsOpen={false}/>)}
    </QueryClientProvider>);
}
