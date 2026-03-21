"use client";

import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { useTranslation } from "@/shared/lib/hooks";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  label,
  placeholder = "••••••••",
  required,
  className,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-text-main">
        {label}
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="pr-12 touch-target text-base"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1 touch-target"
          aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
        >
          {show ? (
            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
