"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { User, Search, Settings, MapPin, Rss, Heart, MessageSquare, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  active: boolean;
  id: string;
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Дефолтный порядок вкладок
  const getDefaultMenuItems = (): MenuItem[] => {
    const items = [
      {
        id: "feed",
        icon: Rss,
        label: t("sidebar.feed"),
        path: "/feed",
        active: pathname === "/feed"
      },
      {
        id: "favorites",
        icon: Heart,
        label: t("sidebar.favorites"),
        path: "/favorites",
        active: pathname === "/favorites"
      },
      {
        id: "profile",
        icon: User,
        label: t("sidebar.profile"),
        path: "/profile",
        active: pathname === "/profile"
      },
      {
        id: "my-comments",
        icon: MessageSquare,
        label: t("sidebar.myComments"),
        path: "/my-comments",
        active: pathname === "/my-comments"
      },
      {
        id: "search",
        icon: Search,
        label: t("sidebar.search"),
        path: "/search",
        active: pathname === "/search"
      },
      {
        id: "create-point",
        icon: MapPin,
        label: t("sidebar.createPoint"),
        path: "/points/create",
        active: pathname === "/points/create"
      }
    ];

    // Добавляем админку только для администраторов
    if (userRole === 'admin') {
      items.push({
        id: "admin",
        icon: Settings,
        label: "Админка",
        path: "/admin",
        active: pathname === "/admin"
      });
    }

    return items;
  };

  // Загружаем данные пользователя и порядок вкладок
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
            
            // Восстанавливаем порядок вкладок из профиля
            const defaultItems = getDefaultMenuItems();
            
            if (userData.sidebarOrder && Array.isArray(userData.sidebarOrder)) {
              // Сортируем вкладки согласно сохраненному порядку
              const orderedItems = userData.sidebarOrder
                .map((id: string) => defaultItems.find(item => item.id === id))
                .filter((item): item is MenuItem => item !== undefined);
              
              // Добавляем новые вкладки, которых нет в сохраненном порядке
              const newItems = defaultItems.filter(
                item => !userData.sidebarOrder.includes(item.id)
              );
              
              setMenuItems([...orderedItems, ...newItems]);
            } else {
              setMenuItems(defaultItems);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMenuItems(getDefaultMenuItems());
        }
      }
    };

    fetchUserData();
  }, [checkAuth, accessToken, pathname, userRole]);

  // Обновляем active состояние при изменении pathname
  useEffect(() => {
    setMenuItems(prev => prev.map(item => ({
      ...item,
      active: pathname === item.path
    })));
  }, [pathname]);

  // Сохраняем порядок на сервер
  const saveSidebarOrder = async (newOrder: string[]) => {
    if (!accessToken) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/sidebar-order`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sidebarOrder: newOrder }),
      });
    } catch (error) {
      console.error('Error saving sidebar order:', error);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    
    // Для Firefox обязательно нужно установить данные
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Добавляем небольшую задержку для Firefox
    setTimeout(() => {
      setDraggedIndex(index);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    if (!isEditMode) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...menuItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setMenuItems(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Сохраняем новый порядок на сервер
    const newOrder = newItems.map(item => item.id);
    saveSidebarOrder(newOrder);
  };

  const handleDragEnd = () => {
    if (!isEditMode) return;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Не показываем сайдбар на странице авторизации
  if (pathname === "/auth" || !isAuthenticated) {
    return null;
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
        {isEditMode && (
          <div className="mb-3 p-2 bg-accent/50 rounded-lg text-xs text-text-muted text-center">
            Перетащите вкладки для изменения порядка
          </div>
        )}
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            
            return (
              <li 
                key={item.id}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => !isEditMode && router.push(item.path)}
                className={`transition-all ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'scale-105' : ''} ${
                  isEditMode ? 'cursor-move' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-text-muted hover:text-text-main hover:bg-accent"
                  }`}
                >
                  {isEditMode && (
                    <GripVertical className="h-4 w-4 opacity-70" />
                  )}
                  <Icon className="h-5 w-5" />
                  <span className="font-medium flex-1">{item.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isEditMode
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-text-main hover:bg-accent/80"
          }`}
        >
          {isEditMode ? "Готово" : "Изменить порядок"}
        </button>
        
        <p className="text-xs text-text-muted text-center">
          © 2026 SPM
        </p>
      </div>
    </aside>
  );
}
