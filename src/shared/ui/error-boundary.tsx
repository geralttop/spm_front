"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/hooks";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((error: Error | null, reset: () => void) => React.ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Можно заменить на интеграцию с внешним логгером
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (typeof fallback === "function") {
        return (fallback as (error: Error | null, reset: () => void) => React.ReactNode)(
          error,
          this.reset
        );
      }

      if (fallback) {
        return fallback;
      }

      const { t } = useTranslation();

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <h2 className="text-lg font-semibold text-text-main mb-2">
            {t("errors.unexpected.title")}
          </h2>
          <p className="text-sm text-text-muted mb-4">
            {t("errors.unexpected.description")}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            {t("errors.unexpected.retry")}
          </button>
        </div>
      );
    }

    return children;
  }
}

