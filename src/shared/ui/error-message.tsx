import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorMessage({ message, onRetry, fullScreen = false }: ErrorMessageProps) {
  const { t } = useTranslation('common');
  const containerClass = fullScreen
    ? "flex min-h-screen items-center justify-center bg-background"
    : "flex items-center justify-center py-8";

  return (
    <div className={containerClass}>
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-text-main mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {t('common.retry')}
          </Button>
        )}
      </div>
    </div>
  );
}
