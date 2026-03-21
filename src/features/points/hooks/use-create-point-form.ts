"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getInitialGeolocation,
  useSharedUserLocation,
  updateSharedUserCoords,
} from "@/shared/lib/user-location";
import { type CreatePointRequest } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useMapSettingsQuery } from "@/shared/lib/hooks";
import {
  useCategoriesQuery,
  useContainersQuery,
  useCreatePointMutation,
  useCreateCategoryMutation,
  useCreateContainerMutation,
} from "@/shared/lib/hooks/queries";
import { type MapStyleKey } from "@/shared/config/map-styles";

export function useCreatePointForm() {
  const router = useRouter();
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
    lng: 27.561831,
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
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "lng" || field === "lat") {
      setMarkerPosition((prev) => ({
        ...prev,
        [field]: typeof value === "number" ? value : parseFloat(value as string) || 0,
      }));
    }
  };

  const handleMarkerDragEnd = (lngLat: { lng: number; lat: number }) => {
    setMarkerPosition(lngLat);
    setFormData((prev) => ({
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
          setFormData((prev) => ({ ...prev, containerId: newContainer.id }));
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
          setFormData((prev) => ({ ...prev, categoryId: newCategory.id }));
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

  return {
    router,
    formData,
    markerPosition,
    geoInitDone,
    userLocation,
    mapStyle,
    setMapStyle,
    availableMapStyles,
    categories,
    containers,
    categoriesLoading,
    containersLoading,
    createPointMutation,
    createCategoryMutation,
    createContainerMutation,

    showCreateCategory,
    setShowCreateCategory,
    newCategoryName,
    setNewCategoryName,
    newCategoryColor,
    setNewCategoryColor,

    showCreateContainer,
    setShowCreateContainer,
    newContainerTitle,
    setNewContainerTitle,
    newContainerDescription,
    setNewContainerDescription,

    handleInputChange,
    handleMarkerDragEnd,
    handleCreateCategory,
    handleCreateContainer,
    handleSubmit,
  };
}
