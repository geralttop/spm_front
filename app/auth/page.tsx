"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useToast } from "@/shared/lib/hooks";
import { useRegisterMutation, useLoginMutation, useVerifyEmailMutation, useVerifyLoginMutation } from "@/shared/lib/hooks/queries";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register" | "verify";

export default function AuthPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
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
  const [pendingEmail, setPendingEmail] = useState("");
  const [isFromRegister, setIsFromRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const verifyLoginMutation = useVerifyLoginMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate(
      { email, password, username },
      {
        onSuccess: () => {
          setPendingEmail(email);
          setIsFromRegister(true);
          setMode("verify");
          toast.success(t("auth.verificationSent"));
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || t("auth.errorRegister"));
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
          toast.success(t("auth.verificationSent"));
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || t("auth.errorLogin"));
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
          toast.success(t("auth.verificationSuccess"));
          router.push("/profile");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || t("auth.errorCode"));
        },
      }
    );
  };

  const loading = registerMutation.isPending || loginMutation.isPending || 
                  verifyEmailMutation.isPending || verifyLoginMutation.isPending;

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
                  onClick={() => setMode("register")}
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
                  onClick={() => setMode("login")}
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
