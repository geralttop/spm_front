"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, CodeInput, PasswordInput } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import {
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useVerifyLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/shared/lib/hooks/queries";
import {
  loginSchema,
  registerSchema,
  verifyCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/shared/schemas/user.schema";
import { getErrorMessage, getValidationError } from "@/features/auth/lib/auth-utils";

type AuthMode = "login" | "register" | "verify" | "forgot-password" | "reset-password";

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

  const loading =
    registerMutation.isPending ||
    loginMutation.isPending ||
    verifyEmailMutation.isPending ||
    verifyLoginMutation.isPending ||
    forgotPasswordMutation.isPending ||
    resetPasswordMutation.isPending;

  const errorBlock = formError ? (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {formError}
    </div>
  ) : null;

  if (mode === "forgot-password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-3 py-6 sm:px-4 sm:py-8 safe-area-top safe-area-bottom overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md space-y-5 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-main">
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
                className="touch-target text-base"
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
      <div className="flex min-h-screen items-center justify-center bg-background px-3 py-6 sm:px-4 sm:py-8 safe-area-top safe-area-bottom overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md space-y-5 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-main">
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

            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              label={t("auth.newPassword")}
              required
            />

            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              label={t("auth.confirmPassword")}
              required
            />

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
      <div className="flex min-h-screen items-center justify-center bg-background px-3 py-6 sm:px-4 sm:py-8 safe-area-top safe-area-bottom overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md space-y-5 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-main">
              {t("auth.verifyTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted wrap-break-word">
              {t("auth.verifySubtitle")} <span className="font-medium">{pendingEmail}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4" noValidate>
            {errorBlock}
            <CodeInput value={code} onChange={setCode} disabled={loading} />

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
    <div className="flex min-h-screen items-center justify-center bg-background px-3 py-6 sm:px-4 sm:py-8 safe-area-top safe-area-bottom overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md space-y-5 sm:space-y-6 rounded-xl sm:rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-main">
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
                className="touch-target text-base"
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
              className="touch-target text-base"
            />
          </div>

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label={t("auth.password")}
            required
          />

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
