"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/shared/lib/utils";

const CODE_LENGTH = 6;

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  disabled?: boolean;
}

export function CodeInput({ value, onChange, label, disabled }: CodeInputProps) {
  const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH).padEnd(CODE_LENGTH, "");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setCode = useCallback(
    (next: string) => {
      const digitsOnly = next.replace(/\D/g, "").slice(0, CODE_LENGTH);
      onChange(digitsOnly);
    },
    [onChange]
  );

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    if (v) {
      const arr = digits.split("");
      arr[index] = v;
      setCode(arr.join(""));
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = digits.split("");
      if (digits[index]) {
        arr[index] = "";
        setCode(arr.join(""));
      } else if (index > 0) {
        arr[index - 1] = "";
        setCode(arr.join(""));
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(pasted);
    const nextIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    refs.current[nextIndex]?.focus();
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-text-main">{label}</label>
      )}
      <div className="flex justify-center gap-1.5 sm:gap-2.5">
        {Array.from({ length: CODE_LENGTH }, (_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digits[i] ?? ""}
            disabled={disabled}
            onFocus={(e) => e.target.select()}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              "h-11 w-8 min-w-0 sm:h-12 sm:w-10 md:h-14 md:w-12 rounded-lg sm:rounded-xl border-2 border-border bg-card text-center text-lg sm:text-xl md:text-2xl font-semibold text-text-main",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 sm:focus:scale-110",
              "placeholder:text-text-muted/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-target"
            )}
            aria-label={`${label || "Code"} ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
