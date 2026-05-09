"use client";

import { useEffect } from "react";
import { ThemeSwitcher } from "@/shared/ui";
import { useTranslation } from "@/shared/lib/hooks";
import { useProfileStickyTitleStore } from "@/shared/lib/store";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const stickyTitle = useProfileStickyTitleStore((s) => s.title);
    const identityVisible = useProfileStickyTitleStore((s) => s.isIdentityVisible);
    const resetStickyProfile = useProfileStickyTitleStore((s) => s.reset);
    useEffect(() => {
        const onProfileRoute =
            pathname === "/profile" || pathname?.startsWith("/user/");
        if (!onProfileRoute) {
            resetStickyProfile();
        }
    }, [pathname, resetStickyProfile]);
    const showProfileStickyName =
        Boolean(stickyTitle) &&
        (pathname === "/profile" || pathname?.startsWith("/user/")) &&
        !identityVisible;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
            <div className="flex h-14 sm:h-16 items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="-ml-2 rounded-lg p-2 transition-colors hover:bg-accent lg:hidden"
                        aria-label={t("common.openMenu")}
                    >
                        <Menu className="h-5 w-5 shrink-0" />
                    </button>
                    {showProfileStickyName ? (
                        <span
                            className="line-clamp-1 min-w-0 truncate text-base font-semibold text-text-main sm:text-lg"
                            aria-live="polite"
                        >
                            {stickyTitle}
                        </span>
                    ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <ThemeSwitcher />
                </div>
            </div>
        </header>
    );
}
