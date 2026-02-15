"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register" | "verify";

export default function AuthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isFromRegister, setIsFromRegister] = useState(false); // Новый флаг
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.register({ email, password, username });
      setPendingEmail(email);
      setIsFromRegister(true); // Устанавливаем флаг регистрации
      setMode("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.errorRegister"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.login({ email, password });
      setPendingEmail(email);
      setIsFromRegister(false); // Устанавливаем флаг логина
      setMode("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.errorLogin"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Используем правильный эндпоинт в зависимости от того, откуда пришли
      const response = isFromRegister
        ? await authApi.verifyEmail({ email: pendingEmail, code })
        : await authApi.verifyLogin({ email: pendingEmail, code });

      // Сохраняем только access token (refresh token в httpOnly cookie)
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t("auth.errorCode"));
    } finally {
      setLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-main">
              {t("auth.verifyTitle")}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {t("auth.verifySubtitle")} {pendingEmail}
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
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.verifying") : t("auth.verifyButton")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode("login");
                setCode("");
                setError("");
                setIsFromRegister(false); // Сбрасываем флаг
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-main">
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
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t("auth.loading")
              : mode === "login"
              ? t("auth.loginButton")
              : t("auth.registerButton")}
          </Button>

          <div className="text-center text-sm text-text-muted">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  {t("auth.registerButton")}
                </button>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-medium text-primary hover:underline"
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
