import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/lib/store";
import { favoritesApi } from "@/shared/api";
import { useFavoritePointIdsQuery } from "@/shared/lib/hooks/queries/use-favorites-query";

const FAVORITE_POINT_IDS_KEY = ["favorite-point-ids"] as const;

export function useFavoriteStatus(
  pointId: string,
  onFavoriteChange?: () => void
) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: pointIds, isLoading: idsLoading } =
    useFavoritePointIdsQuery();
  const [toggleLoading, setToggleLoading] = useState(false);

  const favoriteSet = useMemo(
    () => new Set(pointIds ?? []),
    [pointIds]
  );

  const isFavorite =
    Boolean(accessToken) && Boolean(pointIds) && favoriteSet.has(pointId);

  const isLoading = toggleLoading || (!!accessToken && idsLoading && !pointIds);

  const toggleFavorite = async () => {
    if (!accessToken || toggleLoading) return;

    setToggleLoading(true);
    const wasFavorite = favoriteSet.has(pointId);
    try {
      if (wasFavorite) {
        await favoritesApi.remove(pointId);
      } else {
        await favoritesApi.add(pointId);
      }

      queryClient.setQueryData<string[]>(FAVORITE_POINT_IDS_KEY, (old) => {
        const next = new Set(old ?? []);
        if (wasFavorite) {
          next.delete(pointId);
        } else {
          next.add(pointId);
        }
        return Array.from(next);
      });

      queryClient.invalidateQueries({ queryKey: ["favorites"] });

      onFavoriteChange?.();
    } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
    } finally {
      setToggleLoading(false);
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
}
