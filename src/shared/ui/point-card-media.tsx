import { useState, useEffect, useMemo } from "react";
import { Map as MapIcon, Images } from "lucide-react";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import type { Point } from "@/shared/api";
import {
  useTranslation,
  useMapSettingsQuery,
  useInView,
} from "@/shared/lib/hooks";
import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import {
  updateSharedUserCoords,
  useSharedUserLocation,
} from "@/shared/lib/user-location";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { cn } from "@/shared/lib/utils";
import { POINT_MEDIA_ASPECT_CSS } from "@/shared/lib/point-media-aspect";

interface PointCardMediaProps {
  point: Point;
}

export function PointCardMedia({ point }: PointCardMediaProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    availableMapStyles,
    defaultMapStyle,
    pointCardInitialView,
    loadSettings,
  } = useSettingsStore();
  const { data: mapSettings } = useMapSettingsQuery();
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);

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
      loadSettings(mapSettings);
    }
  }, [accessToken, mapSettings, loadSettings]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <p className="text-xs sm:text-sm text-text-muted">{t("map.mapStyle")}</p>
        <div className="flex items-center gap-2">
          <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-text-muted shrink-0" />
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
              <MapComponent
                center={[
                  point.coords.coordinates[0],
                  point.coords.coordinates[1],
                ]}
                zoom={15}
                styles={{
                  light: MAP_STYLES[mapStyle].light,
                  dark: MAP_STYLES[mapStyle].dark,
                }}
              >
                <MapMarker
                  longitude={point.coords.coordinates[0]}
                  latitude={point.coords.coordinates[1]}
                >
                  <MarkerContent>
                    <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
                  </MarkerContent>
                  <MarkerTooltip>{point.name}</MarkerTooltip>
                  <MarkerPopup>
                    <div className="space-y-1">
                      <p className="font-medium text-text-main">{point.name}</p>
                      {point.description && (
                        <p className="text-sm text-text-muted">
                          {point.description}
                        </p>
                      )}
                      <p className="text-xs text-text-muted">
                        {point.coords.coordinates[1].toFixed(4)},{" "}
                        {point.coords.coordinates[0].toFixed(4)}
                      </p>
                    </div>
                  </MarkerPopup>
                </MapMarker>

                {userLocation && (
                  <MapMarker
                    longitude={userLocation.longitude}
                    latitude={userLocation.latitude}
                    anchor="center"
                  >
                    <MarkerContent className="cursor-default">
                      <div
                        className="relative flex size-6 items-center justify-center"
                        role="img"
                        aria-label={t("map.yourLocation")}
                      >
                        <span
                          className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-pulse"
                          aria-hidden
                        />
                        <span
                          className="relative size-3 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/50"
                          aria-hidden
                        />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>{t("map.yourLocation")}</MarkerTooltip>
                  </MapMarker>
                )}

                <MapControls
                  position="bottom-right"
                  showZoom
                  showCompass
                  showLocate
                  showFullscreen
                  onLocate={(c) =>
                    updateSharedUserCoords({
                      longitude: c.longitude,
                      latitude: c.latitude,
                    })
                  }
                  className="[&_button]:size-7 [&_svg]:size-3.5 sm:[&_button]:size-8 sm:[&_svg]:size-4"
                />
              </MapComponent>
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted"
                aria-hidden
              >
                <MapIcon className="h-8 w-8 opacity-40" />
                <span className="text-xs">{t("map.mapLoading")}</span>
              </div>
            )}
          </div>

          {hasPhotos && (
            <div
              className={cn(
                "absolute inset-0 bg-background",
                view !== "photos" && "pointer-events-none invisible opacity-0"
              )}
              aria-hidden={view !== "photos"}
            >
              <Swiper
                modules={[Pagination, Keyboard]}
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                className="h-full w-full [&_.swiper-pagination-bullet-active]:bg-primary"
              >
                {photos.map((ph) => (
                  <SwiperSlide
                    key={ph.id}
                    className="!flex h-full items-center justify-center bg-muted/20"
                  >
                    <img
                      src={`${apiBase}${ph.url}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
