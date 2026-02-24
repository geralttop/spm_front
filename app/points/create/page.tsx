"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/shared/ui";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from "@/shared/ui/map";
import { type CreatePointRequest } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useTranslation, useToast } from "@/shared/lib/hooks";
import { 
  useCategoriesQuery, 
  useContainersQuery, 
  useCreatePointMutation,
  useCreateCategoryMutation,
  useCreateContainerMutation 
} from "@/shared/lib/hooks/queries";
import { MapPin, Tag, Package, Plus, ArrowLeft, Map as MapIcon } from "lucide-react";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";

export default function CreatePointPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { availableMapStyles, defaultMapStyle, loadSettings } = useSettingsStore();
  
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

  useEffect(() => {
    const initPage = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth");
      } else {
        await loadSettings();
      }
    };

    initPage();
  }, [checkAuth, router, loadSettings]);

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
    if (!newContainerTitle.trim()) {
      toast.error("Введите название контейнера");
      return;
    }

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
          toast.success("Контейнер создан успешно");
        },
        onError: () => {
          toast.error("Ошибка создания контейнера");
        },
      }
    );
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Введите название категории");
      return;
    }

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
          toast.success("Категория создана успешно");
        },
        onError: () => {
          toast.error("Ошибка создания категории");
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Введите название точки");
      return;
    }
    
    if (!formData.containerId) {
      toast.error("Выберите контейнер");
      return;
    }
    
    if (!formData.categoryId) {
      toast.error("Выберите категорию");
      return;
    }

    createPointMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Точка создана успешно!");
        setTimeout(() => router.push("/profile"), 1500);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Ошибка создания точки");
      },
    });
  };

  const loading = categoriesLoading || containersLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-main">Создать точку</h1>
              <p className="text-text-muted mt-1">Добавьте новую точку на карту</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-main mb-4">
                Основная информация
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Описание
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Опишите эту точку..."
                    maxLength={1000}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Coordinates Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Координаты
              </h2>
              
              {/* Интерактивная карта */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-text-muted">
                    Перетащите маркер на карте для выбора координат
                  </p>
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-text-muted" />
                    <select
                      value={mapStyle}
                      onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
                      className="text-sm rounded-md border border-border bg-background px-2 py-1 text-text-main focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {availableMapStyles.map((key) => (
                        <option key={key} value={key}>
                          {MAP_STYLES[key].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
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
                            className="fill-primary stroke-white dark:fill-primary"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Долгота (lng) *
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => handleInputChange("lng", parseFloat(e.target.value) || 0)}
                    placeholder="27.561831"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Пример: 27.561831 (для Минска)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Широта (lat) *
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => handleInputChange("lat", parseFloat(e.target.value) || 0)}
                    placeholder="53.902496"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Пример: 53.902496 (для Минска)
                  </p>
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Категория
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Выберите категорию *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("categoryId", parseInt(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value={0}>Выберите категорию</option>
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
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Создать новую категорию
                  </Button>
                </div>

                {showCreateCategory && (
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-medium text-text-main mb-3">Новая категория</h3>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Название категории"
                        maxLength={50}
                      />
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-text-muted">
                          Цвет:
                        </label>
                        <input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-12 h-8 rounded border border-border cursor-pointer"
                        />
                        <span className="text-sm text-text-muted">{newCategoryColor}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                          size="sm"
                        >
                          {createCategoryMutation.isPending ? "Создание..." : "Создать"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateCategory(false)}
                          size="sm"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Container Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-main mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Контейнер
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Выберите контейнер *
                  </label>
                  <select
                    value={formData.containerId}
                    onChange={(e) => handleInputChange("containerId", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-main focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Выберите контейнер</option>
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
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Создать новый контейнер
                  </Button>
                </div>

                {showCreateContainer && (
                  <div className="border border-border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-medium text-text-main mb-3">Новый контейнер</h3>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={newContainerTitle}
                        onChange={(e) => setNewContainerTitle(e.target.value)}
                        placeholder="Название контейнера"
                        maxLength={100}
                      />
                      <Textarea
                        value={newContainerDescription}
                        onChange={(e) => setNewContainerDescription(e.target.value)}
                        placeholder="Описание контейнера (необязательно)"
                        maxLength={500}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCreateContainer}
                          disabled={createContainerMutation.isPending || !newContainerTitle.trim()}
                          size="sm"
                        >
                          {createContainerMutation.isPending ? "Создание..." : "Создать"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateContainer(false)}
                          size="sm"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createPointMutation.isPending}
                className="flex-1"
              >
                {createPointMutation.isPending ? "Создание..." : "Создать точку"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createPointMutation.isPending}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
