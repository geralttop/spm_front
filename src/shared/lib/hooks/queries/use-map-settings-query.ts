import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/shared/api";
export function useMapSettingsQuery() {
    return useQuery({
        queryKey: ["mapSettings"],
        queryFn: () => settingsApi.getMapSettings(),
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
}
