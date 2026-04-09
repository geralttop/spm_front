"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, useSidebarStore } from "@/shared/lib/store";
import { useTranslation, useProfileQuery } from "@/shared/lib/hooks";
import { useChatUnreadCountQuery } from "@/shared/lib/hooks/queries/use-chats-queries";
import { User, Search, Settings, MapPin, Rss, Heart, MessageSquare, MessagesSquare, X, Map, FolderKanban } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
interface MenuItem {
    icon: any;
    label: string;
    path: string;
    active: boolean;
    id: string;
    unreadBadge?: number;
}
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}
export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { t, currentLanguage } = useTranslation();
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const accessToken = useAuthStore((state) => state.accessToken);
    const { sidebarOrder, loadSidebarOrder } = useSidebarStore();
    const { data: profile } = useProfileQuery();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const userRole = profile?.role || null;
    const { data: unreadData } = useChatUnreadCountQuery(Boolean(accessToken));
    const chatsUnread = unreadData?.count ?? 0;
    const defaultMenuItems = useMemo((): MenuItem[] => {
        const items = [
            {
                id: "feed",
                icon: Rss,
                label: t("sidebar.feed"),
                path: "/feed",
                active: pathname === "/feed"
            },
            {
                id: "map",
                icon: Map,
                label: t("sidebar.map"),
                path: "/map",
                active: pathname === "/map"
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
                id: "chats",
                icon: MessagesSquare,
                label: t("sidebar.chats"),
                path: "/chats",
                active: pathname === "/chats" || Boolean(pathname?.startsWith("/chats/"))
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
            },
            {
                id: "manage",
                icon: FolderKanban,
                label: t("sidebar.manage"),
                path: "/manage",
                active: pathname === "/manage"
            },
            {
                id: "settings",
                icon: Settings,
                label: t("sidebar.settings"),
                path: "/settings",
                active: pathname === "/settings"
            }
        ];
        if (userRole === 'admin') {
            items.push({
                id: "admin",
                icon: Settings,
                label: t("sidebar.admin"),
                path: "/admin",
                active: pathname === "/admin"
            });
        }
        return items;
    }, [pathname, userRole, currentLanguage, t]);
    useEffect(() => {
        const fetchUserData = async () => {
            const isAuth = await checkAuth();
            setIsAuthenticated(isAuth);
            if (isAuth && accessToken && profile) {
                await loadSidebarOrder(profile);
            }
        };
        fetchUserData();
    }, [checkAuth, accessToken, loadSidebarOrder, profile]);
    const menuItems = useMemo(() => {
        const orderedItems = sidebarOrder
            .map((id: string) => defaultMenuItems.find((item: MenuItem) => item.id === id))
            .filter((item: MenuItem | undefined): item is MenuItem => item !== undefined);
        const newItems = defaultMenuItems.filter(item => !sidebarOrder.includes(item.id));
        const merged = [...orderedItems, ...newItems];
        return merged.map((item) => item.id === "chats" ? { ...item, unreadBadge: chatsUnread } : item);
    }, [sidebarOrder, defaultMenuItems, chatsUnread]);
    const handleNavigation = (path: string) => {
        router.push(path);
        onClose();
    };
    if (pathname === "/auth" || !isAuthenticated) {
        return null;
    }
    return (<>
      
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex-col">
        
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-text-main">SPM</h1>
          <p className="text-sm text-text-muted mt-1">{t("common.fullTitle")}</p>
        </div>

        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
            const Icon = item.icon;
            return (<li key={item.id}>
                  <button onClick={() => handleNavigation(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-text-muted hover:text-text-main hover:bg-accent"}`}>
                    <Icon className="h-5 w-5 shrink-0"/>
                    <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                    {item.id === "chats" && (item.unreadBadge ?? 0) > 0 ? (<span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${item.active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"}`} aria-label={t("chats.unreadBadge")}>
                        {(item.unreadBadge ?? 0) > 99 ? "99+" : item.unreadBadge}
                      </span>) : null}
                  </button>
                </li>);
        })}
          </ul>
        </nav>

        
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            © 2026 SPM
          </p>
        </div>
      </aside>

      
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-[60] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-main">SPM</h1>
            <p className="text-xs text-text-muted">{t("common.fullTitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.closeMenu')}>
            <X className="h-5 w-5"/>
          </button>
        </div>

        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
            const Icon = item.icon;
            return (<li key={item.id}>
                  <button onClick={() => handleNavigation(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-text-muted hover:text-text-main hover:bg-accent"}`}>
                    <Icon className="h-5 w-5 shrink-0"/>
                    <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                    {item.id === "chats" && (item.unreadBadge ?? 0) > 0 ? (<span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${item.active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"}`} aria-label={t("chats.unreadBadge")}>
                        {(item.unreadBadge ?? 0) > 99 ? "99+" : item.unreadBadge}
                      </span>) : null}
                  </button>
                </li>);
        })}
          </ul>
        </nav>

        
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            © 2026 SPM
          </p>
        </div>
      </aside>
    </>);
}
