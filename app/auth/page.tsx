"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { useRegisterMutation, useLoginMutation, useVerifyEmailMutation, useVerifyLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from "@/shared/lib/hooks/queries";
import { loginSchema, registerSchema, verifyCodeSchema, forgotPasswordSchema, resetPasswordSchema } from "@/shared/schemas/user.schema";
import { Eye, EyeOff } from "lucide-react";
import type { z } from "zod";
import { cn } from "@/shared/lib/utils";

const CODE_LENGTH = 6;

type AuthMode = "login" | "register" | "verify" | "forgot-password" | "reset-password";

function CodeInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  disabled?: boolean;
}) {
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
      <div className="flex justify-center gap-2 sm:gap-2.5">
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
              "h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-border bg-card text-center text-xl sm:text-2xl font-semibold text-text-main",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:scale-110",
              "placeholder:text-text-muted/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-target"
            )}
            aria-label={`${label || "Код"} цифра ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function getErrorMessage(error: any, fallback: string): string {
  const msg = error?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string") return msg;
  return error?.message && error.message !== "No access token available" ? error.message : fallback;
}

function getValidationError(result: { error: { issues: Array<{ path?: unknown[]; message?: unknown }> } }, invalidEmailT: string): string {
  const issues = result.error.issues;
  const first = issues[0];
  if (!first) return invalidEmailT;
  if (first.path?.[0] === "email") return invalidEmailT;
  return first.message != null ? String(first.message) : invalidEmailT;
}

export default function AuthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        router.push("/profile");
      }
    };
    
    checkAuthentication();
  }, [checkAuth, router]);
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isFromRegister, setIsFromRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const verifyLoginMutation = useVerifyLoginMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = registerSchema.safeParse({ email, password, username: username || undefined });
    if (!parsed.success) {
      setFormError(getValidationError(parsed, t("auth.invalidEmail")));
      return;
    }
    registerMutation.mutate(
      { email, password, username },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setIsFromRegister(true);
          setMode("verify");
        },
        onError: (error: any) => {
          setFormError(getErrorMessage(error, t("auth.errorRegister")));
        },
      }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFormError(getValidationError(parsed, t("auth.invalidEmail")));
      return;
    }
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setIsFromRegister(false);
          setMode("verify");
        },
        onError: (error: any) => {
          setFormError(getErrorMessage(error, t("auth.errorWrongEmailOrPassword")));
        },
      }
    );
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = verifyCodeSchema.safeParse({ email: pendingEmail, code });
    if (!parsed.success) {
      setFormError(getValidationError(parsed, t("auth.invalidEmail")));
      return;
    }
    const mutation = isFromRegister ? verifyEmailMutation : verifyLoginMutation;
    
    mutation.mutate(
      { email: pendingEmail, code },
      {
        onSuccess: () => {
          router.push("/profile");
        },
        onError: (error: any) => {
          setFormError(getErrorMessage(error, t("auth.errorCode")));
        },
      }
    );
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFormError(getValidationError(parsed, t("auth.invalidEmail")));
      return;
    }
    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setMode("reset-password");
        },
        onError: (error: any) => {
          setFormError(getErrorMessage(error, t("auth.errorForgotPassword")));
        },
      }
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setFormError(t("auth.passwordMismatch"));
      return;
    }
    setFormError(null);
    const parsed = resetPasswordSchema.safeParse({ email: pendingEmail, code, newPassword });
    if (!parsed.success) {
      setFormError(getValidationError(parsed, t("auth.invalidEmail")));
      return;
    }
    resetPasswordMutation.mutate(
      { email: pendingEmail, code, newPassword },
      {
        onSuccess: () => {
          setMode("login");
          setCode("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error: any) => {
          setFormError(getErrorMessage(error, t("auth.errorResetPassword")));
        },
      }
    );
  };

  const loading = registerMutation.isPending || loginMutation.isPending || 
                  verifyEmailMutation.isPending || verifyLoginMutation.isPending ||
                  forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

  const errorBlock = formError ? (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {formError}
    </div>
  ) : null;

  if (mode === "forgot-password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              {t("auth.forgotPasswordTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("auth.forgotPasswordSubtitle")}
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
            {errorBlock}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t("auth.email")}
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="touch-target"
              />
            </div>

            <Button type="submit" className="w-full touch-target" disabled={loading}>
              {loading ? t("auth.sending") : t("auth.sendResetCode")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full touch-target"
              onClick={() => setMode("login")}
            >
              {t("auth.backToLogin")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "reset-password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              {t("auth.resetPasswordTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted wrap-break-word">
              {t("auth.resetPasswordSubtitle")} <span className="font-medium">{pendingEmail}</span>
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {errorBlock}
            <CodeInput
              value={code}
              onChange={setCode}
              label={t("auth.verificationCode")}
              disabled={loading}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t("auth.newPassword")}
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-12 touch-target"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1 touch-target"
                  aria-label={showNewPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-12 touch-target"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1 touch-target"
                  aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full touch-target" disabled={loading}>
              {loading ? t("auth.resetting") : t("auth.resetPasswordButton")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full touch-target"
              onClick={() => {
                setMode("login");
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              {t("auth.backToLogin")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              {t("auth.verifyTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted wrap-break-word">
              {t("auth.verifySubtitle")} <span className="font-medium">{pendingEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            {errorBlock}
            <CodeInput
              value={code}
              onChange={setCode}
              disabled={loading}
            />

            <Button type="submit" className="w-full touch-target" disabled={loading}>
              {loading ? t("auth.verifying") : t("auth.verifyButton")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full touch-target"
              onClick={() => {
                setMode("login");
                setCode("");
                setIsFromRegister(false);
              }}
            >
              {t("auth.backButton")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 rounded-lg border border-border bg-card p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">
            {mode === "login" ? t("auth.login") : t("auth.register")}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {mode === "login"
              ? t("auth.loginSubtitle")
              : t("auth.registerSubtitle")}
          </p>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-4"
          noValidate
        >
          {errorBlock}
          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t("auth.username")}
              </label>
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="touch-target"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              {t("auth.email")}
            </label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="touch-target"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12 touch-target"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1 touch-target"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full touch-target" disabled={loading}>
            {loading
              ? t("auth.loading")
              : mode === "login"
              ? t("auth.loginButton")
              : t("auth.registerButton")}
          </Button>

          {mode === "login" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-sm text-primary hover:underline touch-target"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>
          )}

          <div className="text-center text-sm text-text-muted">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-medium text-primary hover:underline touch-target inline-block"
                >
                  {t("auth.registerButton")}
                </button>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-medium text-primary hover:underline touch-target inline-block"
                >
                  {t("auth.loginButton")}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
