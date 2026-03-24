"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "@/shared/config/i18n";
import { feedApi } from "@/shared/api";
import type { FeedPoint } from "@/shared/api/feed";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useMapSettingsQuery } from "@/shared/lib/hooks";
import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MapPopupPhotos,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { buttonVariants } from "@/shared/ui/button/button";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";
import {
  MapPin,
  User,
  Calendar,
  Loader2,
  ChevronDown,
  MessageCircle,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatRelativeDate } from "@/shared/lib/utils";
import { MapFiltersComponent, type MapFilters } from "@/widgets/map-filters";
import { getInitialGeolocation } from "@/shared/lib/user-location";

/** Запасной вид, если нет ни гео, ни точек (не Москва). */
const FALLBACK_CENTER: [number, number] = [15, 50];
const FALLBACK_ZOOM = 4;

function markerLabelText(point: FeedPoint): string {
  const raw = point.category?.name?.trim() || point.name.trim();
  if (raw.length <= 22) return raw;
  return `${raw.slice(0, 20)}…`;
}

function getAuthorInitials(point: FeedPoint): string {
  const first = point.author.firstName?.trim().charAt(0) ?? "";
  const last = point.author.lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;
  return point.author.username?.slice(0, 2).toUpperCase() || "U";
}

function resolveAuthorAvatarUrl(avatar?: string): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${apiBase}${avatar}`;
}

function mapsDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export default function MapPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { availableMapStyles, defaultMapStyle, loadSettings, isInitialized } = useSettingsStore();
  const { data: mapSettings } = useMapSettingsQuery();

  const [points, setPoints] = useState<FeedPoint[]>([]);
  const [allPoints, setAllPoints] = useState<FeedPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);
  const [center, setCenter] = useState<[number, number]>(FALLBACK_CENTER);
  const [zoom, setZoom] = useState(FALLBACK_ZOOM);
  const [filters, setFilters] = useState<MapFilters>({
    authorIds: [],
    dateFrom: "",
    dateTo: "",
    categoryIds: [],
    containerIds: [],
  });
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [response, geo] = await Promise.all([
        feedApi.getFeed(1, 1000),
        getInitialGeolocation(),
      ]);

      setAllPoints(response.points);

      if (geo) {
        setUserLocation(geo);
        setCenter([geo.longitude, geo.latitude]);
        setZoom(12);
      } else if (response.points.length > 0) {
        setUserLocation(null);
        const first = response.points[0];
        setCenter([first.coords.coordinates[0], first.coords.coordinates[1]]);
        setZoom(12);
      } else {
        setUserLocation(null);
        setCenter(FALLBACK_CENTER);
        setZoom(FALLBACK_ZOOM);
      }
    } catch (err) {
      console.error("Error loading map data:", err);
      setError(i18n.t("map.pointsLoadFailed"));
      setAllPoints([]);
      setUserLocation(null);
      setCenter(FALLBACK_CENTER);
      setZoom(FALLBACK_ZOOM);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    if (loading) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        });
      },
      () => {
        /* игнорируем — начальное состояние уже задано getCurrentPosition */
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 30_000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [accessToken, loading]);

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth");
      return;
    }

    if (mapSettings) {
      loadSettings(mapSettings);
    }
  }, [accessToken, router, mapSettings, loadSettings]);

  useEffect(() => {
    if (isInitialized) {
      setMapStyle(defaultMapStyle);
      void loadMapData();
    }
  }, [isInitialized, defaultMapStyle, loadMapData]);

  useEffect(() => {
    let filtered = [...allPoints];

    const allAuthorIds = Array.from(new Set(allPoints.map((p) => p.author.id)));
    const isAllAuthorsSelected = filters.authorIds.length === allAuthorIds.length;

    if (filters.authorIds.length > 0 && !isAllAuthorsSelected) {
      filtered = filtered.filter((point) => filters.authorIds.includes(point.author.id));
    }

    const allCategoryIds = Array.from(
      new Set(allPoints.filter((p) => p.category).map((p) => p.category!.id))
    );
    const isAllCategoriesSelected = filters.categoryIds.length === allCategoryIds.length;

    if (filters.categoryIds.length > 0 && !isAllCategoriesSelected) {
      filtered = filtered.filter(
        (point) => point.category && filters.categoryIds.includes(point.category.id)
      );
    }

    const allContainerIds = Array.from(
      new Set(allPoints.filter((p) => p.container).map((p) => p.container!.id))
    );
    const isAllContainersSelected = filters.containerIds.length === allContainerIds.length;

    if (filters.containerIds.length > 0 && !isAllContainersSelected) {
      filtered = filtered.filter(
        (point) => point.container && filters.containerIds.includes(point.container.id)
      );
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter((point) => new Date(point.createdAt) >= dateFrom);
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((point) => new Date(point.createdAt) <= dateTo);
    }

    setPoints(filtered);
  }, [filters, allPoints]);

  if (!accessToken) {
    return null;
  }

  return (
    <div className="fixed inset-0 top-14 z-0 h-[calc(100vh-3.5rem)] w-full pb-[env(safe-area-inset-bottom)] sm:top-16 sm:h-[calc(100vh-4rem)] lg:left-64 lg:w-[calc(100%-16rem)]">
      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted">{t("map.loadingPoints")}</p>
        </div>
      ) : (
        <>
          {/* Стиль карты — компактно справа сверху */}
          <div className="pointer-events-none absolute right-2 top-2 z-10 sm:right-4 sm:top-4">
            <div className="pointer-events-auto relative max-w-[min(13rem,calc(100vw-4.5rem))] rounded-lg border border-border bg-card/95 shadow-md backdrop-blur-sm sm:max-w-[15rem]">
              <label
                htmlFor="map-style-select"
                className="sr-only"
              >
                {t("map.mapStyle")}
              </label>
              <select
                id="map-style-select"
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                className="w-full min-w-0 cursor-pointer appearance-none rounded-lg border-0 bg-transparent py-2 pl-2.5 pr-9 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary sm:py-2.5 sm:pl-3 sm:pr-10 sm:text-sm touch-manipulation"
                title={t("map.mapStyle")}
              >
                {availableMapStyles.map((key) => (
                  <option key={key} value={key}>
                    {t(`mapStyles.${key}.name`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:right-2.5"
                aria-hidden
              />
            </div>
          </div>

          {/* Счётчик точек — слева сверху, симметрично стилю */}
          {!error && (
            <div className="pointer-events-none absolute left-2 top-2 z-10 sm:left-4 sm:top-4">
              <div className="pointer-events-auto max-w-[min(14rem,calc(100vw-5rem))] rounded-lg border border-border bg-card/95 px-2.5 py-1.5 shadow-md backdrop-blur-sm sm:px-3 sm:py-2">
                <p className="truncate text-xs text-text-main sm:text-sm">
                  {t("map.pointsOnMap")}{" "}
                  <span className="font-semibold">{points.length}</span>
                </p>
              </div>
            </div>
          )}

          <MapComponent
            center={center}
            zoom={zoom}
            styles={{
              light: MAP_STYLES[mapStyle].light,
              dark: MAP_STYLES[mapStyle].dark,
            }}
          >
            {points.map((point) => {
              const [lng, lat] = point.coords.coordinates;
              const categoryName = point.category?.name ?? "";
              const commentsCount = point.commentsCount ?? 0;
              const categoryColor = point.category?.color ?? "hsl(var(--muted-foreground))";
              const containerColor = point.container?.color ?? "hsl(var(--primary))";
              const avatarUrl = resolveAuthorAvatarUrl(point.author.avatar);
              const authorInitials = getAuthorInitials(point);

              return (
                <MapMarker key={point.id} longitude={lng} latitude={lat}>
                  <MarkerContent>
                    <div
                      className="relative size-9 cursor-pointer rounded-full p-[3px] shadow-lg hover:scale-110 transition-transform motion-reduce:transition-none"
                      style={{
                        background: `conic-gradient(${containerColor} 0deg 180deg, ${categoryColor} 180deg 360deg)`,
                      }}
                    >
                      <div className="flex size-full items-center justify-center rounded-full bg-background p-[1px]">
                        <div className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-[10px] font-semibold text-text-main">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- URL с API
                            <img
                              src={avatarUrl}
                              alt={`${point.author.firstName} ${point.author.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{authorInitials}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <MarkerLabel
                      position="bottom"
                      className="max-w-[9rem] truncate rounded-md border border-border bg-card/95 px-1.5 py-0.5 text-[10px] font-medium text-text-main shadow-sm backdrop-blur-sm"
                    >
                      {markerLabelText(point)}
                    </MarkerLabel>
                  </MarkerContent>
                  <MarkerPopup closeButton className="p-0 w-[min(calc(100vw-2rem),17.5rem)] overflow-hidden border-border">
                    <MapPopupPhotos
                      photos={point.photos ?? []}
                      pointName={point.name}
                      categoryColor={point.category?.color}
                    />
                    <div className="space-y-2 p-3">
                      <div>
                        {categoryName ? (
                          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                            {categoryName}
                          </span>
                        ) : (
                          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                            {t("map.popup.noCategory")}
                          </span>
                        )}
                        <h3 className="font-semibold leading-tight text-text-main">
                          {point.name}
                        </h3>
                      </div>

                      {point.description ? (
                        <p className="line-clamp-2 text-sm text-text-muted">{point.description}</p>
                      ) : null}

                      {commentsCount > 0 ? (
                        <div className="flex items-center gap-1.5 text-sm text-text-muted">
                          <MessageCircle className="size-3.5 shrink-0 text-primary" />
                          <span>
                            {t("map.popup.commentsWithCount", { count: commentsCount })}
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Calendar className="size-3.5 shrink-0" />
                        <span>{formatRelativeDate(point.createdAt)}</span>
                      </div>

                      {point.address ? (
                        <div className="flex items-start gap-2 text-xs text-text-muted">
                          <MapPin className="mt-0.5 size-3 shrink-0" />
                          <span className="min-w-0 leading-snug">{point.address}</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2 border-t border-border pt-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-text-main">
                            {point.author.firstName} {point.author.lastName}
                          </p>
                          <p className="truncate text-xs text-text-muted">@{point.author.username}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <a
                          href={mapsDirectionsUrl(lat, lng)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ size: "sm", variant: "default" }),
                            "h-8 flex-1 gap-0"
                          )}
                        >
                          <Navigation className="mr-1.5 size-3.5 shrink-0" />
                          {t("map.popup.directions")}
                        </a>
                        <Link
                          href={`/points/${point.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ size: "sm", variant: "outline" }),
                            "size-8 shrink-0 p-0"
                          )}
                          aria-label={t("map.popup.openInNewTab")}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              );
            })}

            {userLocation && (
              <MapMarker
                longitude={userLocation.longitude}
                latitude={userLocation.latitude}
                anchor="center"
              >
                <MarkerContent className="cursor-default">
                  <div
                    className="relative flex size-7 items-center justify-center"
                    role="img"
                    aria-label={t("map.yourLocation")}
                  >
                    <span
                      className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-pulse"
                      aria-hidden
                    />
                    <span
                      className="relative size-3.5 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/50"
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
              onLocate={(coords) =>
                setUserLocation({
                  longitude: coords.longitude,
                  latitude: coords.latitude,
                })
              }
            />
          </MapComponent>

          <MapFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            allPoints={allPoints}
          />

          {error && (
            <div className="absolute left-1/2 top-16 z-20 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 shadow-lg sm:top-20 sm:max-w-lg sm:p-4">
              <p className="text-center text-xs text-destructive sm:text-left sm:text-sm">
                {error}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
