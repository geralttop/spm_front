"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { feedApi } from "@/shared/api";
import type { FeedPoint } from "@/shared/api/feed";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { Map as MapComponent, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/shared/ui/map";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";
import { MapPin, User, Calendar, Loader2 } from "lucide-react";
import { formatRelativeDate } from "@/shared/lib/utils";

export default function MapPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { availableMapStyles, defaultMapStyle, loadSettings } = useSettingsStore();
  
  const [points, setPoints] = useState<FeedPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);
  const [center, setCenter] = useState<[number, number]>([37.6173, 55.7558]); // Москва по умолчанию
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (!accessToken) {
      router.push("/auth");
      return;
    }

    loadSettings();
    loadPoints();
  }, [accessToken, router, loadSettings]);

  const loadPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем все точки из ленты (подписки)
      const response = await feedApi.getFeed(1, 1000);
      setPoints(response.points);

      // Если есть точки, центрируем карту на первой
      if (response.points.length > 0) {
        const firstPoint = response.points[0];
        setCenter([firstPoint.coords.coordinates[0], firstPoint.coords.coordinates[1]]);
        setZoom(12);
      }
    } catch (err) {
      console.error("Error loading points:", err);
      setError("Не удалось загрузить точки");
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen">
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
                    <span className="text-xs text-text-muted">{t('map.category')}</span>
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
                  {t('map.viewDetails')}
                </button>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}

        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </MapComponent>

      {/* Селектор стиля карты */}
      <div className="absolute top-4 right-4 z-10">
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
          className="bg-surface text-text-main border border-border rounded-md px-3 py-2 text-sm shadow-lg"
        >
          {availableMapStyles.map((key) => (
            <option key={key} value={key}>
              {MAP_STYLES[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Индикатор загрузки */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-surface/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-muted">{t('map.loadingPoints')}</p>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Счетчик точек */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 z-10 bg-surface/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm text-text-main">
            {t('map.pointsOnMap')} <span className="font-semibold">{points.length}</span>
          </p>
        </div>
      )}
    </div>
  );
}
