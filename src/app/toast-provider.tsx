"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--color-surface)",
          color: "var(--color-text-main)",
          border: "1px solid var(--color-border)",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "var(--color-secondary)",
            secondary: "white",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "var(--color-destructive)",
            secondary: "white",
          },
        },
      }}
    />
  );
}
