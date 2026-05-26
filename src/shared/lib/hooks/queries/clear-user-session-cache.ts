import type { QueryClient } from "@tanstack/react-query";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useSidebarStore } from "@/shared/lib/store/sidebar-store";

const USER_QUERY_ROOTS = new Set([
    "profile",
    "favorites",
    "favorite-point-ids",
    "feed",
    "points",
    "point",
    "bio-history",
    "subscription-stats",
    "followers",
    "following",
    "mapSettings",
    "chats",
    "point-history",
    "zlata",
    "vinland",
]);

export function clearUserSessionCache(queryClient: QueryClient) {
    queryClient.removeQueries({
        predicate: (query) => {
            const root = query.queryKey[0];
            return typeof root === "string" && USER_QUERY_ROOTS.has(root);
        },
    });
    useSidebarStore.getState().resetSession();
    useSettingsStore.getState().resetSession();
}
