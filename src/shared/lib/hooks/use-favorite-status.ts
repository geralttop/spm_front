import { useState, useEffect } from "react";
import { useAuthStore } from "@/shared/lib/store";
import { favoritesApi } from "@/shared/api";

const favoriteCache = new Map<
  string,
  { isFavorite: boolean; count: number; timestamp: number }
>();
const CACHE_DURATION = 30000;

export function useFavoriteStatus(
  pointId: string,
  onFavoriteChange?: () => void
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkFavoriteStatus = async () => {
      if (!accessToken) return;

      const cached = favoriteCache.get(pointId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setIsFavorite(cached.isFavorite);
        return;
      }

      try {
        const data = await favoritesApi.check(pointId);
        const isFav = data.isFavorite;

        setIsFavorite(isFav);

        favoriteCache.set(pointId, {
          isFavorite: isFav,
          count: 0,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Ошибка при проверке статуса избранного:", error);
      }
    };

    timeoutId = setTimeout(checkFavoriteStatus, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pointId, accessToken]);

  const toggleFavorite = async () => {
    if (!accessToken || isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(pointId);
      } else {
        await favoritesApi.add(pointId);
      }

      const newIsFavorite = !isFavorite;

      setIsFavorite(newIsFavorite);

      favoriteCache.set(pointId, {
        isFavorite: newIsFavorite,
        count: 0,
        timestamp: Date.now(),
      });

      onFavoriteChange?.();
    } catch (error) {
      console.error("Ошибка при изменении избранного:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
}
