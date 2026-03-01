import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message, fullScreen = false }: LoadingProps) {
  const { t } = useTranslation();
  const defaultMessage = t('common.loading');
  
  const containerClass = fullScreen
    ? "flex min-h-screen items-center justify-center bg-background"
    : "flex items-center justify-center py-8";

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2 text-text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{message || defaultMessage}</span>
      </div>
    </div>
  );
}
