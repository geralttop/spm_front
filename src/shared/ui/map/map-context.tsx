"use client";

import { createContext, useContext } from "react";
import type MapLibreGL from "maplibre-gl";

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

export { MapContext, useMap };
export type { MapContextValue };
