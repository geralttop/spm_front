"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (isAuthenticated) {
      router.push("/profile");
    } else {
      router.push("/auth");
    }
  }, [checkAuth, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-text-muted">{t("profile.loading")}</div>
    </div>
  );
}
