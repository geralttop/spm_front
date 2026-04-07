import { create } from 'zustand';
import { MAP_STYLES, type MapStyleKey } from '@/shared/config/map-styles';
import { settingsApi, type MapSettings, type PointCardInitialView } from '@/shared/api';

const MAP_STYLE_KEYS = new Set(
  Object.keys(MAP_STYLES) as MapStyleKey[],
);

/** Один параллельный запрос getMapSettings на все вызовы loadSettings без данных (защита от 429). */
let mapSettingsFetchInFlight: Promise<MapSettings> | null = null;

function fetchMapSettingsDeduped(): Promise<MapSettings> {
  if (!mapSettingsFetchInFlight) {
    mapSettingsFetchInFlight = settingsApi.getMapSettings().finally(() => {
      mapSettingsFetchInFlight = null;
    });
  }
  return mapSettingsFetchInFlight;
}

interface SettingsState {
  availableMapStyles: MapStyleKey[];
  defaultMapStyle: MapStyleKey;
  /** Что показывать первым в карточке точки: карта или фото */
  pointCardInitialView: PointCardInitialView;
  isLoading: boolean;
  isInitialized: boolean;

  loadSettings: (settingsData?: {
    availableMapStyles: MapStyleKey[];
    defaultMapStyle: MapStyleKey;
    pointCardInitialView?: PointCardInitialView;
  }) => Promise<void>;
  setAvailableMapStyles: (styles: MapStyleKey[]) => Promise<void>;
  setDefaultMapStyle: (style: MapStyleKey) => Promise<void>;
  setPointCardInitialView: (view: PointCardInitialView) => Promise<void>;
  toggleMapStyle: (style: MapStyleKey) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_MAP_STYLES: MapStyleKey[] = ['carto', 'openstreet3d'];
const DEFAULT_STYLE: MapStyleKey = 'carto';
const DEFAULT_POINT_CARD_VIEW: PointCardInitialView = 'map';

function normalizeMapSettingsPayload(
  settings: Pick<MapSettings, "availableMapStyles" | "defaultMapStyle"> & {
    pointCardInitialView?: PointCardInitialView;
  },
): MapSettings {
  const seen = new Set<MapStyleKey>();
  const available: MapStyleKey[] = [];
  for (const k of settings.availableMapStyles ?? []) {
    if (MAP_STYLE_KEYS.has(k) && !seen.has(k)) {
      seen.add(k);
      available.push(k);
    }
  }
  const finalAvailable =
    available.length > 0 ? available : [...DEFAULT_MAP_STYLES];
  let def = settings.defaultMapStyle;
  if (!MAP_STYLE_KEYS.has(def)) {
    def = DEFAULT_STYLE;
  }
  if (!finalAvailable.includes(def)) {
    def = finalAvailable.includes(DEFAULT_STYLE)
      ? DEFAULT_STYLE
      : finalAvailable[0];
  }
  return {
    availableMapStyles: finalAvailable,
    defaultMapStyle: def,
    pointCardInitialView:
      settings.pointCardInitialView ?? DEFAULT_POINT_CARD_VIEW,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  availableMapStyles: DEFAULT_MAP_STYLES,
  defaultMapStyle: DEFAULT_STYLE,
  pointCardInitialView: DEFAULT_POINT_CARD_VIEW,
  isLoading: false,
  isInitialized: false,

  loadSettings: async (settingsData) => {
    // Повторно применяем данные из API/кэша query, даже если уже инициализировались
    // (например после смены настроек и invalidateQueries).
    if (get().isInitialized && settingsData === undefined) {
      return;
    }

    set({ isLoading: true });
    try {
      let settings = settingsData;

      if (!settings) {
        settings = await fetchMapSettingsDeduped();
      }

      const normalized = normalizeMapSettingsPayload(settings);

      set({
        availableMapStyles: normalized.availableMapStyles,
        defaultMapStyle: normalized.defaultMapStyle,
        pointCardInitialView: normalized.pointCardInitialView,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({
        availableMapStyles: DEFAULT_MAP_STYLES,
        defaultMapStyle: DEFAULT_STYLE,
        pointCardInitialView: DEFAULT_POINT_CARD_VIEW,
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
      const updated = normalizeMapSettingsPayload(
        await settingsApi.updateMapSettings({
          availableMapStyles: styles,
          defaultMapStyle: newDefault,
        }),
      );

      set({
        availableMapStyles: updated.availableMapStyles,
        defaultMapStyle: updated.defaultMapStyle,
        pointCardInitialView: updated.pointCardInitialView,
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
      const updated = normalizeMapSettingsPayload(
        await settingsApi.updateMapSettings({
          defaultMapStyle: style,
        }),
      );

      set({
        defaultMapStyle: updated.defaultMapStyle,
        pointCardInitialView: updated.pointCardInitialView,
      });
    } catch (error) {
      console.error('Failed to update default map style:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setPointCardInitialView: async (view) => {
    set({ isLoading: true });
    try {
      const updated = normalizeMapSettingsPayload(
        await settingsApi.updateMapSettings({
          pointCardInitialView: view,
        }),
      );
      set({
        pointCardInitialView: updated.pointCardInitialView,
        availableMapStyles: updated.availableMapStyles,
        defaultMapStyle: updated.defaultMapStyle,
      });
    } catch (error) {
      console.error('Failed to update point card view:', error);
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
      const updated = normalizeMapSettingsPayload(
        await settingsApi.updateMapSettings({
          availableMapStyles: DEFAULT_MAP_STYLES,
          defaultMapStyle: DEFAULT_STYLE,
          pointCardInitialView: DEFAULT_POINT_CARD_VIEW,
        }),
      );

      set({
        availableMapStyles: updated.availableMapStyles,
        defaultMapStyle: updated.defaultMapStyle,
        pointCardInitialView: updated.pointCardInitialView,
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

