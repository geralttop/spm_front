"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { useRegisterMutation, useLoginMutation, useVerifyEmailMutation, useVerifyLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from "@/shared/lib/hooks/queries";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const verifyLoginMutation = useVerifyLoginMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate(
      { email, password, username },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setIsFromRegister(true);
          setMode("verify");
        },
      }
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setIsFromRegister(false);
          setMode("verify");
        },
      }
    );
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const mutation = isFromRegister ? verifyEmailMutation : verifyLoginMutation;
    
    mutation.mutate(
      { email: pendingEmail, code },
      {
        onSuccess: () => {
          router.push("/profile");
        },
      }
    );
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setMode("reset-password");
        },
      }
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) return;

    resetPasswordMutation.mutate(
      { email: pendingEmail, code, newPassword },
      {
        onSuccess: () => {
          setMode("login");
          setCode("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  const loading = registerMutation.isPending || loginMutation.isPending || 
                  verifyEmailMutation.isPending || verifyLoginMutation.isPending ||
                  forgotPasswordMutation.isPending || resetPasswordMutation.isPending;
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

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t("auth.verificationCode")}
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="text-center text-xl sm:text-2xl tracking-widest touch-target"
              />
            </div>

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

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="text-center text-xl sm:text-2xl tracking-widest touch-target"
              />
            </div>

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
        >
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
