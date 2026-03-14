import { create } from 'zustand';
import { type MapStyleKey } from '@/shared/config/map-styles';
import { settingsApi } from '@/shared/api';

interface SettingsState {
  // Доступные стили карт для выбора
  availableMapStyles: MapStyleKey[];
  // Стиль карты по умолчанию
  defaultMapStyle: MapStyleKey;
  // Флаг загрузки
  isLoading: boolean;
  // Флаг инициализации
  isInitialized: boolean;
  
  // Действия
  loadSettings: (settingsData?: { availableMapStyles: MapStyleKey[]; defaultMapStyle: MapStyleKey }) => Promise<void>;
  setAvailableMapStyles: (styles: MapStyleKey[]) => Promise<void>;
  setDefaultMapStyle: (style: MapStyleKey) => Promise<void>;
  toggleMapStyle: (style: MapStyleKey) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_MAP_STYLES: MapStyleKey[] = ['openstreet', 'openstreet3d', 'satellite', 'carto'];
const DEFAULT_STYLE: MapStyleKey = 'openstreet';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  availableMapStyles: DEFAULT_MAP_STYLES,
  defaultMapStyle: DEFAULT_STYLE,
  isLoading: false,
  isInitialized: false,

  loadSettings: async (settingsData?: { availableMapStyles: MapStyleKey[]; defaultMapStyle: MapStyleKey }) => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      // Если данные переданы, используем их
      let settings = settingsData;
      
      // Если данные не переданы, запрашиваем их (fallback)
      if (!settings) {
        settings = await settingsApi.getMapSettings();
      }
      
      set({
        availableMapStyles: settings.availableMapStyles,
        defaultMapStyle: settings.defaultMapStyle,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Используем значения по умолчанию при ошибке
      set({
        availableMapStyles: DEFAULT_MAP_STYLES,
        defaultMapStyle: DEFAULT_STYLE,
        isInitialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setAvailableMapStyles: async (styles) => {
    // Убедимся, что хотя бы один стиль выбран
    if (styles.length === 0) {
      styles = [DEFAULT_STYLE];
    }
    
    // Если текущий стиль по умолчанию не в списке, установим первый из списка
    const currentDefault = get().defaultMapStyle;
    const newDefault = styles.includes(currentDefault) ? currentDefault : styles[0];
    
    set({ isLoading: true });
    try {
      await settingsApi.updateMapSettings({
        availableMapStyles: styles,
        defaultMapStyle: newDefault,
      });
      
      set({ 
        availableMapStyles: styles,
        defaultMapStyle: newDefault,
      });
    } catch (error) {
      console.error('Failed to update available map styles:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultMapStyle: async (style) => {
    // Убедимся, что стиль доступен
    const available = get().availableMapStyles;
    if (!available.includes(style)) {
      return;
    }
    
    set({ isLoading: true });
    try {
      await settingsApi.updateMapSettings({
        defaultMapStyle: style,
      });
      
      set({ defaultMapStyle: style });
    } catch (error) {
      console.error('Failed to update default map style:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleMapStyle: async (style) => {
    const current = get().availableMapStyles;
    const isIncluded = current.includes(style);
    
    if (isIncluded) {
      // Не позволяем удалить последний стиль
      if (current.length === 1) {
        return;
      }
      
      const newStyles = current.filter(s => s !== style);
      await get().setAvailableMapStyles(newStyles);
    } else {
      const newStyles = [...current, style];
      await get().setAvailableMapStyles(newStyles);
    }
  },

  resetToDefaults: async () => {
    set({ isLoading: true });
    try {
      await settingsApi.updateMapSettings({
        availableMapStyles: DEFAULT_MAP_STYLES,
        defaultMapStyle: DEFAULT_STYLE,
      });
      
      set({
        availableMapStyles: DEFAULT_MAP_STYLES,
        defaultMapStyle: DEFAULT_STYLE,
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

