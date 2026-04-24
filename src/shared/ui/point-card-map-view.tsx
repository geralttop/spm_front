"use client";

import { Map as MapIcon } from "lucide-react";
import { useTranslation } from "@/shared/lib/hooks";
import type { Point } from "@/shared/api";
import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/shared/ui/map";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";

export function PointCardMapView({
  point,
  mapStyle,
  mapStyleReady,
  userLocation,
  onLocate,
}: {
  point: Point;
  mapStyle: MapStyleKey | null;
  mapStyleReady: boolean;
  userLocation: { longitude: number; latitude: number } | null;
  onLocate: (coords: { longitude: number; latitude: number }) => void;
}) {
  const { t } = useTranslation();

  if (!mapStyleReady || !mapStyle) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted"
        aria-hidden
      >
        <MapIcon className="h-8 w-8 opacity-40" />
        <span className="text-xs">{t("map.mapLoading")}</span>
      </div>
    );
  }

  return (
    <MapComponent
      center={[point.coords.coordinates[0], point.coords.coordinates[1]]}
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
          <div className="size-4 rounded-full bg-primary border-2 border-background shadow-lg" />
        </MarkerContent>
        <MarkerTooltip>{point.name}</MarkerTooltip>
        <MarkerPopup>
          <div className="space-y-1">
            <p className="font-medium text-text-main">{point.name}</p>
            {point.description && (
              <p className="text-sm text-text-muted">{point.description}</p>
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
        showCenterOnPoint
        centerOnPointCoords={{
          longitude: point.coords.coordinates[0],
          latitude: point.coords.coordinates[1],
        }}
        showFullscreen
        onLocate={onLocate}
        className="[&_button]:size-7 [&_svg]:size-3.5 sm:[&_button]:size-8 sm:[&_svg]:size-4"
      />
    </MapComponent>
  );
}

