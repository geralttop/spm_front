import { ReactNode } from "react";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-main">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
