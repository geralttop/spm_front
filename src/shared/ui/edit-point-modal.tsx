import { useState, useEffect } from 'react';
import { X, MapPin, Map as MapIcon } from 'lucide-react';
import { pointsApi, categoriesApi, containersApi, type Point, type Category, type Container } from '@/shared/api';
import { useTranslation } from 'react-i18next';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from '@/shared/ui/map';
import { useSettingsStore } from '@/shared/lib/store/settings-store';
import { MAP_STYLES, type MapStyleKey } from '@/shared/config/map-styles';
import { useTranslation as useI18n } from '@/shared/lib/hooks';

interface EditPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: Point;
  onSuccess?: () => void;
}

export function EditPointModal({ isOpen, onClose, point, onSuccess }: EditPointModalProps) {
  const { t } = useTranslation();
  const { t: tI18n } = useI18n();
  const { availableMapStyles, defaultMapStyle } = useSettingsStore();
  
  const [name, setName] = useState(point.name);
  const [description, setDescription] = useState(point.description || '');
  const [lng, setLng] = useState(point.coords.coordinates[0]);
  const [lat, setLat] = useState(point.coords.coordinates[1]);
  const [categoryId, setCategoryId] = useState(point.category?.id || 0);
  const [containerId, setContainerId] = useState(point.container?.id || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);
  const [markerPosition, setMarkerPosition] = useState({
    lng: point.coords.coordinates[0],
    lat: point.coords.coordinates[1],
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [categoriesData, containersData] = await Promise.all([
        categoriesApi.getAll(),
        containersApi.getAll(),
      ]);
      setCategories(categoriesData);
      setContainers(containersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Ошибка загрузки данных');
    }
  };

  const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
    setMarkerPosition(lngLat);
    setLng(lngLat.lng);
    setLat(lngLat.lat);
  };

  const handleLngChange = (value: number) => {
    setLng(value);
    setMarkerPosition(prev => ({ ...prev, lng: value }));
  };

  const handleLatChange = (value: number) => {
    setLat(value);
    setMarkerPosition(prev => ({ ...prev, lat: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await pointsApi.update(point.id, {
        name,
        description: description || undefined,
        lng,
        lat,
        categoryId,
        containerId,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error updating point:', err);
      setError(err.response?.data?.message || 'Ошибка при обновлении точки');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Редактировать точку</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              maxLength={255}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Координаты <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                  className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  {availableMapStyles.map((key) => (
                    <option key={key} value={key}>
                      {tI18n(`mapStyles.${key}.name`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Перетащите маркер на карте или введите координаты вручную
            </p>
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-300 mb-4">
              <Map 
                center={[markerPosition.lng, markerPosition.lat]} 
                zoom={12}
                styles={{
                  light: MAP_STYLES[mapStyle].light,
                  dark: MAP_STYLES[mapStyle].dark,
                }}
              >
                <MapMarker
                  draggable
                  longitude={markerPosition.lng}
                  latitude={markerPosition.lat}
                  onDragEnd={handleMarkerDragEnd}
                >
                  <MarkerContent>
                    <div className="cursor-move">
                      <MapPin
                        className="fill-primary stroke-white"
                        size={32}
                      />
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Координаты точки</p>
                      <p className="text-xs text-muted-foreground">
                        {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                      </p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
                <MapControls showZoom showLocate showFullscreen />
              </Map>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Долгота (lng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Широта (lat) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Категория <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Контейнер <span className="text-red-500">*</span>
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Выберите контейнер</option>
              {containers.map((cont) => (
                <option key={cont.id} value={cont.id}>
                  {cont.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
