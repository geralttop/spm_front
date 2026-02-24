"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Heart, User, Plus, Menu, Map } from "lucide-react";
import { useTranslation } from "@/shared/lib/hooks";
import { cn } from "@/shared/lib/utils";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    {
      icon: Home,
      label: t("sidebar.feed"),
      path: "/feed",
      active: pathname === "/feed"
    },
    {
      icon: Map,
      label: t("sidebar.map"),
      path: "/map",
      active: pathname === "/map"
    },
    {
      icon: Plus,
      label: t("sidebar.createPoint"),
      path: "/points/create",
      active: pathname === "/points/create"
    },
    {
      icon: Heart,
      label: t("sidebar.favorites"),
      path: "/favorites",
      active: pathname === "/favorites"
    },
    {
      icon: User,
      label: t("sidebar.profile"),
      path: "/profile",
      active: pathname === "/profile"
    }
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom lg:hidden",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors touch-target",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-text-muted hover:text-text-main hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}