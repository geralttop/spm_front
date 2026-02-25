import type { MapStyleKey } from '@/shared/config/map-styles';

export interface MapSettings {
  availableMapStyles: MapStyleKey[];
  defaultMapStyle: MapStyleKey;
}
