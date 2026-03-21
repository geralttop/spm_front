"use client";

import { ThemeSwitcher } from "@/shared/ui";
import { useTranslation } from "@/shared/lib/hooks";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t, ready } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 flex-1">
          {/* Кнопка меню для мобильных */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
            aria-label={t('common.openMenu')}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h1 
            className="text-lg sm:text-xl font-bold text-text-main cursor-pointer hover:opacity-80 transition-opacity truncate"
            onClick={() => router.push("/")}
          >
            {mounted && ready ? t("common.title") : "SPM"}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
