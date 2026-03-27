"use client";

import { useCallback, useState } from "react";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useMapSettingsQuery } from "@/shared/lib/hooks/queries/use-map-settings-query";
import type { MapStyleKey } from "@/shared/config/map-styles";

/**
 * Стиль карты без «мигания» OpenStreetMap: сначала берём default из кэша React Query,
 * затем из стора после loadSettings; override — только после выбора пользователем в селекте.
 */
export function useMapStylePreference() {
  const { defaultMapStyle, isInitialized } = useSettingsStore();
  const { data: mapSettings } = useMapSettingsQuery();
  const [override, setOverride] = useState<MapStyleKey | null>(null);

  const mapStyle: MapStyleKey | null =
    override ??
    mapSettings?.defaultMapStyle ??
    (isInitialized ? defaultMapStyle : null);

  const reset = useCallback(() => {
    setOverride(null);
  }, []);

  return {
    mapStyle,
    setMapStyle: setOverride,
    isReady: mapStyle !== null,
    reset,
  };
}
