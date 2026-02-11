"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/lib/hooks";
import { useTranslation } from "@/shared/lib/hooks";
import { Button } from "../button";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? t("theme.switchToDark") : t("theme.switchToLight")}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
