"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { authApi, type ProfileResponse } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!checkAuth()) {
        router.push("/auth");
        return;
      }

      try {
        const data = await authApi.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        clearTokens();
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [checkAuth, router, clearTokens]);

  const handleLogout = () => {
    clearTokens();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">Загрузка...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-main">Профиль</h1>
          <p className="mt-2 text-sm text-text-muted">
            Добро пожаловать в ваш профиль
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-text-muted">Email:</span>
                <p className="font-medium text-text-main">{profile.email}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">ID:</span>
                <p className="font-medium text-text-main">{profile.userId}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">Роль:</span>
                <p className="font-medium text-text-main">{profile.role}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}
