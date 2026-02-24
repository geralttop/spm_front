 'use client';

import type React from 'react';
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapMarker,
  YMapTypeReactContext,
  reactify,
} from '@/shared/lib/ymaps';

interface PointMapProps {
  // [долгота, широта] — как хранится в GeoJSON и как ожидает Yandex Maps
  coordinates: [number, number];
}

export const PointMap: React.FC<PointMapProps> = ({ coordinates }) => {
  const location = reactify.useDefault({
    center: coordinates,
    zoom: 15,
  });

  const markerCoords = reactify.useDefault(coordinates);

  return (
    <div className="mt-4 h-64 w-full overflow-hidden rounded-lg border border-border">
      <YMapTypeReactContext.Provider value={{ type: 'future-map' }}>
        <YMap location={location} mode="vector">
          <YMapDefaultSchemeLayer />
          <YMapDefaultFeaturesLayer />

          <YMapMarker coordinates={markerCoords}>
            <div className="rounded bg-surface/90 px-2 py-1 text-xs shadow">
              Точка
            </div>
          </YMapMarker>
        </YMap>
      </YMapTypeReactContext.Provider>
    </div>
  );
};

