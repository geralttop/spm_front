import { useState, useEffect, useMemo } from "react";
import { Map as MapIcon, Images } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import type { Point } from "@/shared/api";
import {
  useTranslation,
  useMapSettingsQuery,
  useInView,
  useMapStylePreference,
} from "@/shared/lib/hooks";
import {
  updateSharedUserCoords,
  useSharedUserLocation,
} from "@/shared/lib/user-location";
import { cn } from "@/shared/lib/utils";
import { POINT_MEDIA_ASPECT_CSS } from "@/shared/lib/point-media-aspect";
import type { MapStyleKey } from "@/shared/config/map-styles";

interface PointCardMediaProps {
  point: Point;
}

const PointCardMapView = dynamic(
  () =>
    import("@/shared/ui/point-card-map-view").then((m) => m.PointCardMapView),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20" />,
  }
);

const PointCardPhotosView = dynamic(
  () =>
    import("@/shared/ui/point-card-photos-view").then(
      (m) => m.PointCardPhotosView
    ),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted/20" />,
  }
);

export function PointCardMedia({ point }: PointCardMediaProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { availableMapStyles, pointCardInitialView, loadSettings } =
    useSettingsStore();
  const { data: mapSettings } = useMapSettingsQuery();
  const { mapStyle, setMapStyle, isReady: mapStyleReady } =
    useMapStylePreference();

  const photos = useMemo(
    () =>
      [...(point.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [point.photos]
  );
  const hasPhotos = photos.length > 0;

  const [view, setView] = useState<"map" | "photos">(() => {
    if (hasPhotos && pointCardInitialView === "photos") return "photos";
    return "map";
  });

  const { ref: mapViewportRef, inView: mapViewportVisible } = useInView({
    rootMargin: "100px",
    threshold: 0,
    once: true,
  });

  const userLocation = useSharedUserLocation(
    mapViewportVisible && Boolean(accessToken) && view === "map"
  );

  useEffect(() => {
    if (accessToken && mapSettings) {
      void loadSettings(mapSettings);
    }
  }, [accessToken, mapSettings, loadSettings]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <p className="text-xs sm:text-sm text-text-muted">{t("map.mapStyle")}</p>
        <div className="flex items-center gap-2">
          <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-muted shrink-0" />
          {mapStyleReady && mapStyle ? (
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
              className="text-xs sm:text-sm rounded-md border border-border bg-background px-2 py-1 text-text-main focus:outline-none focus:ring-2 focus:ring-ring touch-target min-h-9 sm:min-h-[44px]"
            >
              {availableMapStyles.map((key) => (
                <option key={key} value={key}>
                  {t(`mapStyles.${key}.name`)}
                </option>
              ))}
            </select>
          ) : (
            <div
              className="min-h-9 min-w-[10rem] animate-pulse rounded-md bg-muted dark:bg-muted/80 sm:min-h-[44px]"
              role="status"
              aria-busy="true"
              aria-label={t("map.mapLoading")}
            />
          )}
        </div>
      </div>
      <div className="-mx-3 sm:mx-0" ref={mapViewportRef}>
        <div
          className="relative w-full rounded-none sm:rounded-lg overflow-hidden border border-border bg-muted/30"
          style={{ aspectRatio: POINT_MEDIA_ASPECT_CSS }}
        >
          {hasPhotos && (
            <div className="absolute right-2 top-2 z-[40] flex gap-1 rounded-md border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setView("map")}
                className={cn(
                  "touch-target flex min-h-9 min-w-9 items-center justify-center rounded sm:min-h-8 sm:min-w-8",
                  view === "map"
                    ? "bg-primary text-primary-foreground"
                    : "text-text-muted hover:bg-accent hover:text-text-main"
                )}
                aria-pressed={view === "map"}
                aria-label={t("pointCard.showMap")}
                title={t("pointCard.showMap")}
              >
                <MapIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("photos")}
                className={cn(
                  "touch-target flex min-h-9 min-w-9 items-center justify-center rounded sm:min-h-8 sm:min-w-8",
                  view === "photos"
                    ? "bg-primary text-primary-foreground"
                    : "text-text-muted hover:bg-accent hover:text-text-main"
                )}
                aria-pressed={view === "photos"}
                aria-label={t("pointCard.showPhotos")}
                title={t("pointCard.showPhotos")}
              >
                <Images className="h-4 w-4" />
              </button>
            </div>
          )}

          <div
            className={cn(
              "absolute inset-0",
              view !== "map" && "pointer-events-none invisible opacity-0"
            )}
            aria-hidden={view !== "map"}
          >
            {mapViewportVisible ? (
              <PointCardMapView
                point={point}
                mapStyle={mapStyleReady ? mapStyle : null}
                mapStyleReady={mapStyleReady}
                userLocation={userLocation}
                onLocate={(c) => updateSharedUserCoords(c)}
              />
            ) : null}
          </div>

          {hasPhotos && (
            <div
              className={cn(
                "absolute inset-0 bg-background",
                view !== "photos" && "pointer-events-none invisible opacity-0"
              )}
              aria-hidden={view !== "photos"}
            >
              <PointCardPhotosView photos={photos} apiBase={apiBase} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
