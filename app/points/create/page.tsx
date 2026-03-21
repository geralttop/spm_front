"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation as useI18n } from "react-i18next";
import { Button, Input, Textarea } from "@/shared/ui";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/shared/ui/map";
import {
  getInitialGeolocation,
  useSharedUserLocation,
  updateSharedUserCoords,
} from "@/shared/lib/user-location";
import { type CreatePointRequest } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useTranslation, useMapSettingsQuery } from "@/shared/lib/hooks";
import { 
  useCategoriesQuery, 
  useContainersQuery, 
  useCreatePointMutation,
  useCreateCategoryMutation,
  useCreateContainerMutation 
} from "@/shared/lib/hooks/queries";
import { MapPin, Tag, Package, Plus, ArrowLeft, Map as MapIcon, Info, HelpCircle, Loader2 } from "lucide-react";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";

export default function CreatePointPage() {
  const router = useRouter();
  const { t: tI18n } = useI18n();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { availableMapStyles, defaultMapStyle, loadSettings } = useSettingsStore();
  const { data: mapSettings } = useMapSettingsQuery();
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: containers = [], isLoading: containersLoading } = useContainersQuery();
  const createPointMutation = useCreatePointMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const createContainerMutation = useCreateContainerMutation();

  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [newContainerTitle, setNewContainerTitle] = useState("");
  const [newContainerDescription, setNewContainerDescription] = useState("");

  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");

  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);

  const [formData, setFormData] = useState<CreatePointRequest>({
    name: "",
    description: "",
    lng: 27.561831, // Минск по умолчанию
    lat: 53.902496,
    containerId: "",
    categoryId: 0,
  });

  const [markerPosition, setMarkerPosition] = useState({
    lng: 27.561831,
    lat: 53.902496,
  });
  const [geoInitDone, setGeoInitDone] = useState(false);

  const userLocation = useSharedUserLocation(geoInitDone);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const geo = await getInitialGeolocation();
      if (cancelled) return;
      if (geo) {
        updateSharedUserCoords(geo);
        setMarkerPosition({ lng: geo.longitude, lat: geo.latitude });
        setFormData((prev) => ({
          ...prev,
          lng: geo.longitude,
          lat: geo.latitude,
        }));
      }
      setGeoInitDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const initPage = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth");
      } else if (mapSettings) {
        await loadSettings(mapSettings);
      }
    };

    initPage();
  }, [checkAuth, router, mapSettings, loadSettings]);

  const handleInputChange = (field: keyof CreatePointRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Синхронизация координат с маркером на карте
    if (field === "lng" || field === "lat") {
      setMarkerPosition(prev => ({
        ...prev,
        [field]: typeof value === "number" ? value : parseFloat(value as string) || 0,
      }));
    }
  };

  const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
    setMarkerPosition(lngLat);
    setFormData(prev => ({
      ...prev,
      lng: lngLat.lng,
      lat: lngLat.lat,
    }));
  };

  const handleCreateContainer = () => {
    if (!newContainerTitle.trim()) return;

    createContainerMutation.mutate(
      {
        title: newContainerTitle,
        description: newContainerDescription || undefined,
      },
      {
        onSuccess: (newContainer) => {
          setFormData(prev => ({ ...prev, containerId: newContainer.id }));
          setNewContainerTitle("");
          setNewContainerDescription("");
          setShowCreateContainer(false);
        },
      }
    );
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;

    createCategoryMutation.mutate(
      {
        name: newCategoryName,
        color: newCategoryColor,
      },
      {
        onSuccess: (newCategory) => {
          setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
          setNewCategoryName("");
          setNewCategoryColor("#3B82F6");
          setShowCreateCategory(false);
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.containerId || !formData.categoryId) return;

    createPointMutation.mutate(formData, {
      onSuccess: () => {
        setTimeout(() => router.push("/profile"), 1500);
      },
    });
  };

  const loading = categoriesLoading || containersLoading;

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-1">
        <div className="text-text-muted">{tI18n("createPoint.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-4xl px-0 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:gap-6 sm:px-0">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => router.back()}
              className="gap-2 touch-target w-full shrink-0 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              {tI18n("settings.back")}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                {tI18n("createPoint.title")}
              </h1>
              <p className="mt-1 text-sm text-text-muted sm:text-base">
                {tI18n("createPoint.subtitle")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className="px-1 sm:px-0">
              <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-text-main sm:text-lg">
                {tI18n('createPoint.basicInfo')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Название точки *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Введите название точки"
                    maxLength={100}
                    required
                    className="text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {tI18n('createPoint.description')}
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Опишите эту точку..."
                    maxLength={1000}
                    rows={3}
                    className="text-base sm:text-sm"
                  />
                </div>
              </div>
              </div>
            </div>

            {/* Координаты: подсказка + стиль — с отступами; карта — на всю ширину экрана на мобиле (как в постах) */}
            <div className="space-y-4">
              <div className="px-1 sm:px-0">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-text-main sm:mb-4 sm:text-lg">
                  <MapPin className="h-5 w-5 shrink-0" aria-hidden />
                  {tI18n("createPoint.coordinates")}
                </h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-sm text-text-muted sm:max-w-[60%]">
                    {tI18n("createPoint.dragMarker")}
                  </p>
                  <div className="flex min-w-0 items-center gap-2 sm:max-w-xs sm:shrink-0">
                    <MapIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                    <select
                      value={mapStyle}
                      onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                      className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-ring touch-target sm:min-h-0 sm:py-1"
                      aria-label={t("map.mapStyle")}
                    >
                      {availableMapStyles.map((key) => (
                        <option key={key} value={key}>
                          {t(`mapStyles.${key}.name`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="-mx-3 sm:mx-0">
                <div className="h-[min(52vh,320px)] w-full overflow-hidden border-y border-border bg-muted/20 sm:h-[320px] md:h-[400px] sm:rounded-lg sm:border-x">
                  {!geoInitDone ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-1 text-text-muted">
                      <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary" aria-hidden />
                      <p className="text-center text-sm">{tI18n("createPoint.mapGeoLoading")}</p>
                    </div>
                  ) : (
                    <Map
                      center={[markerPosition.lng, markerPosition.lat]}
                      zoom={12}
                      styles={{
                        light: MAP_STYLES[mapStyle].light,
                        dark: MAP_STYLES[mapStyle].dark,
                      }}
                    >
                      {userLocation && (
                        <MapMarker
                          longitude={userLocation.longitude}
                          latitude={userLocation.latitude}
                          anchor="center"
                          className="pointer-events-none !z-[1]"
                        >
                          <MarkerContent className="pointer-events-none">
                            <div
                              className="relative flex size-7 items-center justify-center"
                              role="img"
                              aria-label={t("map.yourLocation")}
                            >
                              <span
                                className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-pulse"
                                aria-hidden
                              />
                              <span
                                className="relative size-3.5 rounded-full border-2 border-background bg-primary shadow-md ring-2 ring-primary/50"
                                aria-hidden
                              />
                            </div>
                          </MarkerContent>
                        </MapMarker>
                      )}

                      <MapMarker
                        draggable
                        longitude={markerPosition.lng}
                        latitude={markerPosition.lat}
                        onDragEnd={handleMarkerDragEnd}
                        className="relative !z-[30] pointer-events-auto"
                      >
                        <MarkerContent className="cursor-grab active:cursor-grabbing">
                          <div className="pointer-events-auto drop-shadow-md">
                            <MapPin
                              className="fill-primary stroke-white dark:fill-primary"
                              size={32}
                            />
                          </div>
                        </MarkerContent>
                        <MarkerPopup>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {tI18n("createPoint.pointCoordinates")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                            </p>
                          </div>
                        </MarkerPopup>
                      </MapMarker>

                      <MapControls
                        showZoom
                        showLocate
                        showFullscreen
                        onLocate={(c) =>
                          updateSharedUserCoords({
                            longitude: c.longitude,
                            latitude: c.latitude,
                          })
                        }
                      />
                    </Map>
                  )}
                </div>
              </div>

              <div className="px-1 sm:px-0">
                <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {tI18n('createPoint.longitude')}
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => handleInputChange("lng", parseFloat(e.target.value) || 0)}
                    placeholder="27.561831"
                    required
                    className="text-base sm:text-sm"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {tI18n('createPoint.longitudeExample')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {tI18n('createPoint.latitude')}
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => handleInputChange("lat", parseFloat(e.target.value) || 0)}
                    placeholder="53.902496"
                    required
                    className="text-base sm:text-sm"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {tI18n('createPoint.latitudeExample')}
                  </p>
                </div>
              </div>
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="px-1 sm:px-0">
            <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2 sm:text-lg">
                <Tag className="h-5 w-5 shrink-0" aria-hidden />
                {tI18n('createPoint.category')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {tI18n('createPoint.selectCategory')}
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("categoryId", parseInt(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm touch-target sm:min-h-0"
                    required
                  >
                    <option value={0}>{tI18n('createPoint.selectCategoryOption')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCategory(!showCreateCategory)}
                    className="gap-2 w-full touch-target sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    {tI18n('createPoint.createNewCategory')}
                  </Button>
                </div>

                {showCreateCategory && (
                  <div className="border border-border rounded-lg p-2 bg-muted/50 sm:p-4">
                    <h3 className="font-medium text-text-main mb-3">{tI18n('createPoint.newCategory')}</h3>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Название категории"
                        maxLength={50}
                        className="text-base sm:text-sm"
                      />
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-text-muted">
                          {tI18n('createPoint.color')}
                        </label>
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-12 h-8 rounded border border-border cursor-pointer"
                        />
                        <span className="text-sm text-text-muted">{newCategoryColor}</span>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                          size="sm"
                          className="w-full touch-target sm:w-auto sm:min-h-0"
                        >
                          {createCategoryMutation.isPending ? "Создание..." : "Создать"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateCategory(false)}
                          size="sm"
                          className="w-full touch-target sm:w-auto sm:min-h-0"
                        >
                          {tI18n('createPoint.cancel')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Container Card */}
            <div className="px-1 sm:px-0">
            <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:gap-2">
                <h2 className="text-base font-semibold text-text-main flex items-center gap-2 sm:text-lg">
                  <Package className="h-5 w-5 shrink-0" aria-hidden />
                  {tI18n('createPoint.container')}
                </h2>
                <div className="group relative sm:ml-1">
                  <HelpCircle className="h-4 w-4 text-text-muted cursor-help" aria-hidden />
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-6 z-10 w-[min(100vw-2rem,20rem)] max-sm:right-0 max-sm:left-auto sm:w-80 p-4 bg-popover border border-border rounded-lg shadow-lg">
                    <p className="font-medium text-sm text-text-main mb-2">Что такое контейнер?</p>
                    <p className="text-sm text-text-muted mb-3">
                      Контейнер — это коллекция или группа точек. Например: "Мои любимые места", "Рестораны Минска", "Достопримечательности".
                    </p>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium text-text-main mb-1">Отличие от категорий:</p>
                      <p className="text-xs text-text-muted">
                        <span className="font-medium">Категория</span> — это тип точки (ресторан, парк, музей). 
                        <span className="font-medium ml-1">Контейнер</span> — это ваша личная коллекция точек любых типов.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    {tI18n('createPoint.selectContainer')}
                  </label>
                  <select
                    value={formData.containerId}
                    onChange={(e) => handleInputChange("containerId", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm touch-target sm:min-h-0"
                    required
                  >
                    <option value="">{tI18n('createPoint.selectContainerOption')}</option>
                    {containers.map((container) => (
                      <option key={container.id} value={container.id}>
                        {container.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateContainer(!showCreateContainer)}
                    className="gap-2 w-full touch-target sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    {tI18n('createPoint.createNewContainer')}
                  </Button>
                </div>

                {showCreateContainer && (
                  <div className="border border-border rounded-lg p-2 bg-muted/50 sm:p-4">
                    <h3 className="font-medium text-text-main mb-3">{tI18n('createPoint.newContainer')}</h3>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={newContainerTitle}
                        onChange={(e) => setNewContainerTitle(e.target.value)}
                        placeholder="Название контейнера"
                        maxLength={100}
                        className="text-base sm:text-sm"
                      />
                      <Textarea
                        value={newContainerDescription}
                        onChange={(e) => setNewContainerDescription(e.target.value)}
                        placeholder="Описание контейнера (необязательно)"
                        maxLength={500}
                        rows={2}
                        className="text-base sm:text-sm"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          onClick={handleCreateContainer}
                          disabled={createContainerMutation.isPending || !newContainerTitle.trim()}
                          size="sm"
                          className="w-full touch-target sm:w-auto sm:min-h-0"
                        >
                          {createContainerMutation.isPending ? "Создание..." : "Создать"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateContainer(false)}
                          size="sm"
                          className="w-full touch-target sm:w-auto sm:min-h-0"
                        >
                          {tI18n('createPoint.cancel')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 px-1 sm:flex-row sm:px-0">
              <Button
                type="submit"
                disabled={createPointMutation.isPending}
                className="flex-1 touch-target w-full sm:w-auto"
              >
                {createPointMutation.isPending ? "Создание..." : "Создать точку"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createPointMutation.isPending}
                className="touch-target w-full sm:w-auto sm:min-w-[8rem]"
              >
                {tI18n('createPoint.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
