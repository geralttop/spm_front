"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { User, Search, Settings, MapPin, Rss, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
      
      if (isAuth && accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [checkAuth, accessToken]);

  // Загружаем количество избранного
  useEffect(() => {
    const fetchFavoritesCount = async () => {
      if (!accessToken || !isAuthenticated) return;
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/favorites`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        
        if (response.ok) {
          const favorites = await response.json();
          // Можно использовать favorites.length если нужно
        }
      } catch (error) {
        console.error('Error fetching favorites count:', error);
      }
    };

    fetchFavoritesCount();
  }, [accessToken, isAuthenticated]);

  // Не показываем сайдбар на странице авторизации
  if (pathname === "/auth" || !isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      icon: Rss,
      label: t("sidebar.feed"),
      path: "/feed",
      active: pathname === "/feed"
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
    },
    {
      icon: Search,
      label: t("sidebar.search"),
      path: "/search",
      active: pathname === "/search"
    },
    {
      icon: MapPin,
      label: t("sidebar.createPoint"),
      path: "/points/create",
      active: pathname === "/points/create"
    }
  ];

  // Добавляем админку только для администраторов
  if (userRole === 'admin') {
    menuItems.push({
      icon: Settings,
      label: "Админка",
      path: "/admin",
      active: pathname === "/admin"
    });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-text-main">SPM</h1>
        <p className="text-sm text-text-muted mt-1">SharePlacesMap</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-text-muted hover:text-text-main hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium flex-1">{item.label}</span>
                  
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          © 2026 SPM
        </p>
      </div>
    </aside>
  );
}