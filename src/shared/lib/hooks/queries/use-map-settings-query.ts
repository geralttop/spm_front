import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/shared/api";

export function useMapSettingsQuery() {
  return useQuery({
    queryKey: ["mapSettings"],
    queryFn: () => settingsApi.getMapSettings(),
    staleTime: 10 * 60 * 1000, // 10 минут - настройки карты меняются редко
    gcTime: 30 * 60 * 1000, // 30 минут - время хранения в кэше
    retry: 1,
  });
}
