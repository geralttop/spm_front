import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Map as MapIcon, ImagePlus, Trash2 } from 'lucide-react';
import { pointsApi, categoriesApi, containersApi, type Point, type Category, type Container } from '@/shared/api';
import {
  useUploadPointPhotosMutation,
  useDeletePointPhotoMutation,
} from '@/shared/lib/hooks/queries';
import { usePointPhotoCropQueue } from '@/shared/lib/hooks/use-point-photo-crop-queue';
import {
  POINT_CROP_OUTPUT_HEIGHT,
  POINT_CROP_OUTPUT_WIDTH,
} from '@/shared/lib/point-media-aspect';
import { PointPhotoCropModal } from '@/shared/ui/point-photo-crop-modal';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from '@/shared/ui/map';
import { useSettingsStore } from '@/shared/lib/store/settings-store';
import { MAP_STYLES, type MapStyleKey } from '@/shared/config/map-styles';
import { useTranslation } from '@/shared/lib/hooks';

const MAX_POINT_PHOTOS = 10;

interface EditPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: Point;
  onSuccess?: () => void;
}

export function EditPointModal({ isOpen, onClose, point, onSuccess }: EditPointModalProps) {
  const { t } = useTranslation();
  const { availableMapStyles, defaultMapStyle } = useSettingsStore();
  const uploadPhotosMutation = useUploadPointPhotosMutation();
  const deletePhotoMutation = useDeletePointPhotoMutation();
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
  const {
    activeCrop,
    enqueueFiles,
    shiftQueue,
    clearQueue,
  } = usePointPhotoCropQueue();

  const sortedPhotos = useMemo(
    () => [...(point.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [point.photos],
  );

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
    } else {
      clearQueue();
    }
  }, [isOpen, clearQueue]);

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
      setError(t('editPoint.errorLoading'));
    }
  };

  const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
    setMarkerPosition(lngLat);
    setLng(lngLat.lng);
    setLat(lngLat.lat);
  };

  const handleLngChange = (value: number) => {
    setLng(value);
    setMarkerPosition((prev) => ({ ...prev, lng: value }));
  };

  const handleLatChange = (value: number) => {
    setLat(value);
    setMarkerPosition((prev) => ({ ...prev, lat: value }));
  };

  const handlePhotoFilesChosen = (fileList: FileList | null) => {
    enqueueFiles(fileList, {
      maxTotal: MAX_POINT_PHOTOS,
      currentDraftCount: sortedPhotos.length,
    });
  };

  const handleCroppedPhotoUpload = async (blob: Blob) => {
    const file = new File([blob], `point-photo-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    setError('');
    try {
      await uploadPhotosMutation.mutateAsync({
        pointId: point.id,
        payload: {
          files: [file],
          dimensions: [
            { width: POINT_CROP_OUTPUT_WIDTH, height: POINT_CROP_OUTPUT_HEIGHT },
          ],
        },
      });
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Error uploading photos:', err);
      setError(t('editPoint.errorPhotosUpload'));
    } finally {
      shiftQueue();
    }
  };

  const handleCropModalDismiss = () => {
    shiftQueue();
  };

  const handleDeletePhoto = async (photoId: string) => {
    setError('');
    try {
      await deletePhotoMutation.mutateAsync({ pointId: point.id, photoId });
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Error deleting photo:', err);
      setError(t('editPoint.errorPhotoDelete'));
    }
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
    } catch (err: unknown) {
      console.error('Error updating point:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || t('editPoint.errorUpdating'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    {activeCrop && (
      <PointPhotoCropModal
        key={activeCrop.id}
        imageSrc={activeCrop.src}
        onCropComplete={handleCroppedPhotoUpload}
        onClose={handleCropModalDismiss}
      />
    )}
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-point-title"
    >
      <div
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col overflow-hidden border-0 bg-card shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl sm:border sm:border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
          <h2 id="edit-point-title" className="pr-2 text-lg font-semibold text-text-main sm:text-xl">
            {t('editPoint.title')}
          </h2>
          <button
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] touch-target items-center justify-center rounded-lg p-2 text-text-muted transition-colors hover:bg-accent hover:text-text-main disabled:opacity-50"
            disabled={loading}
            type="button"
            aria-label={t('profile.close')}
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto overscroll-y-contain bg-card px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-4 sm:p-6"
        >
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              {t('editPoint.name')} <span className="text-destructive">{t('editPoint.required')}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:py-2"
              required
              maxLength={255}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">{t('editPoint.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:py-2"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <label className="block text-sm font-medium text-text-main">
                {t('editPoint.coordinatesLabel')} <span className="text-destructive">{t('editPoint.required')}</span>
              </label>
              <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:max-w-[min(100%,18rem)]">
                <MapIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                <select
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                  className="min-h-[44px] min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-ring sm:min-h-0 sm:flex-none sm:py-1"
                  disabled={loading}
                  aria-label={t('map.mapStyle')}
                >
                  {availableMapStyles.map((key) => (
                    <option key={key} value={key}>
                      {t(`mapStyles.${key}.name`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mb-3 text-sm text-text-muted">{t('editPoint.coordinatesHint')}</p>
            <div className="mb-3 aspect-[4/3] w-full min-h-[200px] overflow-hidden rounded-lg border border-border sm:mb-4">
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
                      <MapPin className="fill-primary stroke-white" size={32} />
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="space-y-1">
                      <p className="font-medium text-text-main">{t('editPoint.mapPopupTitle')}</p>
                      <p className="text-xs text-text-muted">
                        {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                      </p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
                <MapControls
                  showZoom
                  showLocate
                  showFullscreen
                  className="[&_button]:size-7 [&_svg]:size-3.5 sm:[&_button]:size-8 sm:[&_svg]:size-4"
                />
              </Map>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t('editPoint.longitude')} <span className="text-destructive">{t('editPoint.required')}</span>
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:py-2"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">
                {t('editPoint.latitude')} <span className="text-destructive">{t('editPoint.required')}</span>
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:py-2"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              {t('editPoint.category')} <span className="text-destructive">{t('editPoint.required')}</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
              className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:min-h-0 sm:py-2"
              required
              disabled={loading}
            >
              <option value="">{t('editPoint.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">
              {t('editPoint.container')} <span className="text-destructive">{t('editPoint.required')}</span>
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring sm:min-h-0 sm:py-2"
              required
              disabled={loading}
            >
              <option value="">{t('editPoint.selectContainer')}</option>
              {containers.map((cont) => (
                <option key={cont.id} value={cont.id}>
                  {cont.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-text-main">
              <ImagePlus className="h-4 w-4 shrink-0" aria-hidden />
              {t('editPoint.photos')}
            </h3>
            <p className="mb-3 text-xs text-text-muted">{t('editPoint.photosHint')}</p>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text-main transition-colors hover:bg-accent ${
                loading || uploadPhotosMutation.isPending || sortedPhotos.length >= MAX_POINT_PHOTOS
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                className="sr-only"
                disabled={loading || uploadPhotosMutation.isPending || sortedPhotos.length >= MAX_POINT_PHOTOS}
                onChange={(e) => {
                  handlePhotoFilesChosen(e.target.files);
                  e.target.value = '';
                }}
              />
              {t('editPoint.addPhotos')}
            </label>
            <p className="mt-1 text-xs text-text-muted">
              {t('editPoint.photosCount', { current: sortedPhotos.length, max: MAX_POINT_PHOTOS })}
            </p>
            {sortedPhotos.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {sortedPhotos.map((ph) => (
                  <li
                    key={ph.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30"
                  >
                    <img
                      src={`${apiBase}${ph.url}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => void handleDeletePhoto(ph.id)}
                      disabled={loading || deletePhotoMutation.isPending}
                      className="absolute right-1 top-1 flex min-h-9 min-w-9 items-center justify-center rounded-full border border-border bg-background/90 text-destructive shadow hover:bg-destructive/10"
                      aria-label={t('editPoint.deletePhoto')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-auto flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 rounded-lg border border-border px-4 py-2.5 text-text-main transition-colors hover:bg-accent disabled:opacity-50 sm:min-h-0 sm:py-2"
              disabled={loading}
            >
              {t('editPoint.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] flex-1 rounded-lg bg-primary px-4 py-2.5 text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:py-2"
            >
              {loading ? t('editPoint.saving') : t('editPoint.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
