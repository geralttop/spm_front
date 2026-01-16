"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";

type AuthMode = "login" | "register" | "verify";

export default function AuthPage() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (checkAuth()) {
      router.push("/profile");
    }
  }, [checkAuth, router]);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.register({ email, password, username });
      setPendingEmail(email);
      setMode("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка регистрации");
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
      setMode("verify");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isLogin = mode === "verify" && pendingEmail;
      const response = isLogin
        ? await authApi.verifyLogin({ email: pendingEmail, code })
        : await authApi.verifyEmail({ email: pendingEmail, code });

      if (response.accessToken && response.refreshToken) {
        setTokens(response.accessToken, response.refreshToken);
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Неверный код");
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
              Подтверждение кода
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Введите 6-значный код, отправленный на {pendingEmail}
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
              {loading ? "Проверка..." : "Подтвердить"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode("login");
                setCode("");
                setError("");
              }}
            >
              Назад
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
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {mode === "login"
              ? "Войдите в свой аккаунт"
              : "Создайте новый аккаунт"}
          </p>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                Имя пользователя
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
              Email
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
              Пароль
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Отправка..."
              : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
          </Button>

          <div className="text-center text-sm text-text-muted">
            {mode === "login" ? (
              <>
                Нет аккаунта?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
