import { apiClient } from './client';
import { type MapStyleKey } from '@/shared/config/map-styles';

export interface MapSettings {
  availableMapStyles: MapStyleKey[];
  defaultMapStyle: MapStyleKey;
}

export const settingsApi = {
  async getMapSettings(): Promise<MapSettings> {
    const response = await apiClient.get<MapSettings>('/auth/map-settings');
    return response.data;
  },

  async updateMapSettings(settings: Partial<MapSettings>): Promise<MapSettings> {
    const response = await apiClient.patch<{
      message: string;
      availableMapStyles: MapStyleKey[];
      defaultMapStyle: MapStyleKey;
    }>('/auth/map-settings', settings);
    
    return {
      availableMapStyles: response.data.availableMapStyles,
      defaultMapStyle: response.data.defaultMapStyle,
    };
  },
};
