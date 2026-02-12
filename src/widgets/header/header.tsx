"use client";

import { LanguageSwitcher, ThemeSwitcher } from "@/shared/ui";
import { useTranslation } from "@/shared/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4 flex-1">
          <h1 
            className="text-xl font-bold text-text-main cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/")}
          >
            {mounted && ready ? t("common.title") : "SPM"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
