"use client";
import { useCallback, useState } from "react";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useMapSettingsQuery } from "@/shared/lib/hooks/queries/use-map-settings-query";
import type { MapStyleKey } from "@/shared/config/map-styles";
export function useMapStylePreference() {
    const { defaultMapStyle, isInitialized } = useSettingsStore();
    const { data: mapSettings } = useMapSettingsQuery();
    const [override, setOverride] = useState<MapStyleKey | null>(null);
    const mapStyle: MapStyleKey | null =
        override ??
        (isInitialized
            ? defaultMapStyle
            : (mapSettings?.defaultMapStyle ?? null));
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
