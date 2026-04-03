"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useAuthStore, useSidebarStore } from "@/shared/lib/store";
import { useSettingsStore } from "@/shared/lib/store/settings-store";
import { useTranslation, useMapSettingsQuery, useTheme } from "@/shared/lib/hooks";
import {
  COLOR_PALETTE_IDS,
  COLOR_PALETTE_PREVIEWS,
  type ColorPaletteId,
} from "@/shared/config/theme";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";
import { supportedLocales, type SupportedLocale } from "@/shared/config/i18n-constants";
import { ArrowLeft, Map, Images, Check, RotateCcw, GripVertical, Rss, Heart, User, MessageSquare, MessagesSquare, Search, MapPin, Settings as SettingsIcon, Languages, FolderKanban, Palette } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const MENU_ICONS = {
  feed: Rss,
  map: Map,
  favorites: Heart,
  profile: User,
  "my-comments": MessageSquare,
  chats: MessagesSquare,
  search: Search,
  "create-point": MapPin,
  manage: FolderKanban,
  settings: SettingsIcon,
  admin: SettingsIcon,
};

const getMenuLabel = (itemId: string, t: any): string => {
  const labelMap: Record<string, string> = {
    feed: t("sidebar.feed"),
    map: t("sidebar.map"),
    favorites: t("sidebar.favorites"),
    profile: t("sidebar.profile"),
    "my-comments": t("sidebar.myComments"),
    chats: t("sidebar.chats"),
    search: t("sidebar.search"),
    "create-point": t("sidebar.createPoint"),
    manage: t("sidebar.manage"),
    settings: t("sidebar.settings"),
    admin: t("sidebar.admin"),
  };
  return labelMap[itemId] || itemId;
};

export default function SettingsPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isLoading, setIsLoading] = useState(true);
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { colorPalette, setColorPalette } = useTheme();
  const { data: mapSettings } = useMapSettingsQuery();
  
  const queryClient = useQueryClient();
  const {
    availableMapStyles,
    defaultMapStyle,
    pointCardInitialView,
    isLoading: settingsLoading,
    loadSettings,
    toggleMapStyle,
    setDefaultMapStyle,
    setPointCardInitialView,
    resetToDefaults,
  } = useSettingsStore();

  const {
    sidebarOrder,
    loadSidebarOrder,
    setSidebarOrder: updateSidebarOrder,
    resetToDefaults: resetSidebarOrder,
  } = useSidebarStore();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const initPage = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth");
      } else {
        await loadSettings(mapSettings ?? undefined);
        await loadSidebarOrder();
        setIsLoading(false);
      }
    };

    initPage();
  }, [checkAuth, router, mapSettings, loadSettings, loadSidebarOrder]);

  const handleToggleStyle = async (styleKey: MapStyleKey) => {
    try {
      await toggleMapStyle(styleKey);
    } catch (error) {
      alert(t('settings.updateError'));
    }
  };

  const handleSetDefault = async (styleKey: MapStyleKey) => {
    if (availableMapStyles.includes(styleKey)) {
      try {
        await setDefaultMapStyle(styleKey);
      } catch (error) {
        alert(t('settings.updateError'));
      }
    }
  };

  const handleReset = async () => {
    if (confirm(t('settings.resetConfirm'))) {
      try {
        await resetToDefaults();
      } catch (error) {
        alert(t('settings.resetError'));
      }
    }
  };

  // Sidebar order handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...sidebarOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    // Сохраняем через store (оптимистичное обновление)
    try {
      await updateSidebarOrder(newOrder);
    } catch (error) {
      console.error("Failed to save sidebar order:", error);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleResetSidebarOrder = async () => {
    try {
      await resetSidebarOrder();
    } catch (error) {
      alert(t('settings.resetSidebarError'));
    }
  };

  const handlePointCardInitialView = async (view: "map" | "photos") => {
    try {
      await setPointCardInitialView(view);
      await queryClient.invalidateQueries({ queryKey: ["mapSettings"] });
    } catch {
      alert(t("settings.updateError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">{t('settings.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto max-w-4xl px-1 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 w-full shrink-0 sm:w-auto touch-target"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('settings.back')}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-main">{t('settings.title')}</h1>
              <p className="text-sm sm:text-base text-text-muted mt-1">{t('settings.subtitle')}</p>
            </div>
          </div>

          {/* Sidebar Order Settings */}
          <div className="rounded-lg border border-border bg-card p-3 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between mb-4 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-text-main flex items-center gap-2">
                  <GripVertical className="h-5 w-5 shrink-0" />
                  {t('settings.sidebarOrder')}
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  {t('settings.dragToReorder')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSidebarOrder}
                className="gap-2 self-start xs:self-auto shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                {t('settings.reset')}
              </Button>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              {sidebarOrder.map((itemId, index) => {
                const Icon = MENU_ICONS[itemId as keyof typeof MENU_ICONS];
                const label = getMenuLabel(itemId, t);
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index;

                return (
                  <div
                    key={itemId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border bg-card cursor-move transition-all ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    } ${isDragOver ? 'border-primary scale-105' : 'border-border'} hover:border-primary/50`}
                  >
                    <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
                    {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-text-main shrink-0" />}
                    <span className="font-medium text-sm sm:text-base text-text-main flex-1 truncate">{label}</span>
                    <span className="text-xs text-text-muted shrink-0">#{index + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-text-muted">
                <strong className="text-text-main">{t('settings.tip')}</strong> {t('settings.dragTip')}
              </p>
            </div>
          </div>

          {/* Language Settings */}
          <div className="rounded-lg border border-border bg-card p-3 sm:p-6 shadow-sm">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text-main flex items-center gap-2">
                <Languages className="h-5 w-5 shrink-0" />
                {t('settings.language')}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                {t('settings.languageDescription')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 xs:flex xs:flex-wrap">
              {supportedLocales.map((locale) => {
                const isSelected = currentLanguage === locale;
                const languageNames: Record<SupportedLocale, string> = {
                  ru: "Русский",
                  be: "Беларуская",
                  en: "English",
                  fr: "Français"
                };

                return (
                  <button
                    key={locale}
                    onClick={() => changeLanguage(locale)}
                    className={`px-3 sm:px-4 py-2 rounded-lg border text-sm sm:text-base font-medium transition-all ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-text-main hover:bg-accent'
                    }`}
                  >
                    {languageNames[locale]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color scheme */}
          <div className="rounded-lg border border-border bg-card p-3 sm:p-6 shadow-sm">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text-main flex items-center gap-2">
                <Palette className="h-5 w-5 shrink-0" />
                {t("settings.colorScheme")}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                {t("settings.colorSchemeDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {COLOR_PALETTE_IDS.map((paletteId: ColorPaletteId) => {
                const isSelected = colorPalette === paletteId;
                const preview = COLOR_PALETTE_PREVIEWS[paletteId];
                return (
                  <button
                    key={paletteId}
                    type="button"
                    onClick={() => setColorPalette(paletteId)}
                    className={`text-left relative p-2.5 sm:p-3 rounded-lg border transition-all w-full ${
                      isSelected
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex gap-2 flex-1 min-w-0">
                        <div
                          className="shrink-0 w-10 h-10 rounded-md border border-border overflow-hidden flex flex-col shadow-sm"
                          aria-hidden
                        >
                          <div
                            className="h-1/2 w-full"
                            style={{ backgroundColor: preview.background }}
                          />
                          <div
                            className="h-1/2 w-full"
                            style={{ backgroundColor: preview.primary }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm text-text-main">
                            {t(`settings.colorPalette.${paletteId}.name`)}
                          </h3>
                          <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                            {t(`settings.colorPalette.${paletteId}.description`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Styles Settings */}
          <div className="rounded-lg border border-border bg-card p-3 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between mb-4 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-text-main flex items-center gap-2">
                  <Map className="h-5 w-5 shrink-0" />
                  {t('settings.mapStyles')}
                </h2>
                <p className="text-xs sm:text-sm text-text-muted mt-1">
                  {t('settings.mapStylesDescription')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 self-start xs:self-auto shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                {t('settings.reset')}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {Object.entries(MAP_STYLES).map(([key, style]) => {
                const styleKey = key as MapStyleKey;
                const isEnabled = availableMapStyles.includes(styleKey);
                const isDefault = defaultMapStyle === styleKey;
                const canDisable = availableMapStyles.length > 1 || !isEnabled;
                const isDefaultStyle = ['openstreet', 'openstreet3d', 'satellite', 'carto'].includes(styleKey);
                
                const styleName = t(`mapStyles.${styleKey}.name`);
                const styleDescription = t(`mapStyles.${styleKey}.description`);

                return (
                  <div
                    key={key}
                    className={`relative p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                      isEnabled
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => canDisable && !settingsLoading && handleToggleStyle(styleKey)}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isEnabled
                            ? 'border-primary bg-primary'
                            : 'border-border bg-background'
                        } ${!canDisable || settingsLoading ? 'opacity-50' : ''}`}
                      >
                        {isEnabled && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 pr-16 sm:pr-0">
                          <h3 className="font-medium text-sm text-text-main truncate">{styleName}</h3>
                          {isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium whitespace-nowrap">
                              {t('settings.default')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2">
                          {styleDescription}
                        </p>
                        {isDefaultStyle && !isEnabled && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-text-muted font-medium">
                            {t('settings.recommended')}
                          </span>
                        )}
                      </div>
                    </div>

                    {isEnabled && !isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(styleKey);
                        }}
                        disabled={settingsLoading}
                        className="absolute top-2 right-2 text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-background border border-border hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {t('settings.setAsDefault')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 sm:mt-6 p-2.5 sm:p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs sm:text-sm text-text-muted">
                <strong className="text-text-main">{t('settings.tip')}</strong> {t('settings.mapStylesTip')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 sm:p-6 shadow-sm">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-text-main flex items-center gap-2">
                <Images className="h-5 w-5 shrink-0" />
                {t("settings.pointCardTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                {t("settings.pointCardDescription")}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => void handlePointCardInitialView("map")}
                disabled={settingsLoading}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:flex-none sm:px-6 ${
                  pointCardInitialView === "map"
                    ? "border-primary bg-primary/10 text-text-main"
                    : "border-border bg-background text-text-main hover:bg-accent"
                }`}
              >
                <Map className="h-4 w-4 shrink-0" aria-hidden />
                {t("settings.pointCardFirstMap")}
              </button>
              <button
                type="button"
                onClick={() => void handlePointCardInitialView("photos")}
                disabled={settingsLoading}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:flex-none sm:px-6 ${
                  pointCardInitialView === "photos"
                    ? "border-primary bg-primary/10 text-text-main"
                    : "border-border bg-background text-text-main hover:bg-accent"
                }`}
              >
                <Images className="h-4 w-4 shrink-0" aria-hidden />
                {t("settings.pointCardFirstPhotos")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
