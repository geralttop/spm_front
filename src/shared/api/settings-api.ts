import { apiClient } from './client';
import { type MapStyleKey } from '@/shared/config/map-styles';

export type PointCardInitialView = "map" | "photos";

export interface MapSettings {
  availableMapStyles: MapStyleKey[];
  defaultMapStyle: MapStyleKey;
  pointCardInitialView: PointCardInitialView;
}

export const settingsApi = {
  async getMapSettings(): Promise<MapSettings> {
    const response = await apiClient.get<MapSettings>('/auth/map-settings');
    return response.data;
  },

  async updateMapSettings(
    settings: Partial<MapSettings & { pointCardInitialView?: PointCardInitialView }>
  ): Promise<MapSettings> {
    const response = await apiClient.patch<{
      message: string;
      availableMapStyles: MapStyleKey[];
      defaultMapStyle: MapStyleKey;
      pointCardInitialView: PointCardInitialView;
    }>("/auth/map-settings", settings);

    return {
      availableMapStyles: response.data.availableMapStyles,
      defaultMapStyle: response.data.defaultMapStyle,
      pointCardInitialView: response.data.pointCardInitialView,
    };
  },
};
