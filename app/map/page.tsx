"use client";

import { useCallback, useEffect, useState } from "react";
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
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";
import { MapPin, User, Calendar, Loader2 } from "lucide-react";
import { formatRelativeDate } from "@/shared/lib/utils";
import { MapFiltersComponent, type MapFilters } from "@/widgets/map-filters";
import { getInitialGeolocation } from "@/shared/lib/user-location";

/** Запасной вид, если нет ни гео, ни точек (не Москва). */
const FALLBACK_CENTER: [number, number] = [15, 50];
const FALLBACK_ZOOM = 4;

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
    <div className="fixed inset-0 lg:left-64 top-14 sm:top-16 w-full lg:w-[calc(100%-16rem)] h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted">{t("map.loadingPoints")}</p>
        </div>
      ) : (
        <>
          <MapFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            allPoints={allPoints}
          />

          <MapComponent
            center={center}
            zoom={zoom}
            styles={{
              light: MAP_STYLES[mapStyle].light,
              dark: MAP_STYLES[mapStyle].dark,
            }}
          >
            {points.map((point) => (
              <MapMarker
                key={point.id}
                longitude={point.coords.coordinates[0]}
                latitude={point.coords.coordinates[1]}
              >
                <MarkerContent>
                  <div
                    className="size-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: point.category?.color || "#6B7280" }}
                  />
                </MarkerContent>
                <MarkerPopup closeButton>
                  <div className="min-w-[250px] max-w-[350px] space-y-3">
                    <div>
                      <h3 className="font-semibold text-base text-text-main mb-1">
                        {point.name}
                      </h3>
                      {point.description && (
                        <p className="text-sm text-text-muted">{point.description}</p>
                      )}
                    </div>

                    {point.address && (
                      <div className="flex items-start gap-2 text-xs text-text-muted">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{point.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-main truncate">
                          {point.author.firstName} {point.author.lastName}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          @{point.author.username}
                        </p>
                      </div>
                    </div>

                    {point.category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">{t("map.category")}</span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: point.category.color }}
                        >
                          {point.category.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Calendar className="h-3 w-3" />
                      <span>{formatRelativeDate(point.createdAt)}</span>
                    </div>

                    <button
                      onClick={() => router.push(`/points/${point.id}`)}
                      className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded transition-colors"
                    >
                      {t("map.viewDetails")}
                    </button>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}

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

          <div className="absolute top-4 right-4 z-10 bg-card border border-border rounded-lg shadow-xl p-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                {t("map.mapStyle")}
              </label>
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                className="bg-background text-text-main border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {availableMapStyles.map((key) => (
                  <option key={key} value={key}>
                    {t(`mapStyles.${key}.name`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!error && (
            <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
              <p className="text-sm text-text-main">
                {t("map.pointsOnMap")} <span className="font-semibold">{points.length}</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
