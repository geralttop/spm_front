"use client";

import { useTranslation as useI18n } from "react-i18next";
import { Button, Input, Textarea } from "@/shared/ui";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/shared/ui/map";
import { updateSharedUserCoords } from "@/shared/lib/user-location";
import { useTranslation } from "@/shared/lib/hooks";
import {
  useCreatePointForm,
  CreateCategoryInline,
  CreateContainerInline,
} from "@/features/points";
import { PointPhotoCropModal } from "@/shared/ui/point-photo-crop-modal";
import { MapPin, Tag, Package, ArrowLeft, Map as MapIcon, HelpCircle, Loader2, ImagePlus, X } from "lucide-react";
import { MAP_STYLES } from "@/shared/config/map-styles";

export default function CreatePointPage() {
  const { t: tI18n } = useI18n();
  const { t } = useTranslation();

  const {
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
    photoDrafts,
    removePhotoDraft,
    handlePhotoFilesSelected,
    activeCrop,
    handleCroppedPhoto,
    handleCropModalClose,
    maxPointPhotos,
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
    isSubmitting,
  } = useCreatePointForm();

  const loading = categoriesLoading || containersLoading;

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-1">
        <div className="text-text-muted">{tI18n("createPoint.loading")}</div>
      </div>
    );
  }

  return (
    <>
    {activeCrop && (
      <PointPhotoCropModal
        key={activeCrop.id}
        imageSrc={activeCrop.src}
        onCropComplete={handleCroppedPhoto}
        onClose={handleCropModalClose}
      />
    )}
    <div className="min-h-[100dvh] bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-4xl px-0 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="space-y-6">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="px-1 sm:px-0">
              <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
                <h2 className="mb-4 text-base font-semibold text-text-main sm:text-lg">
                  {tI18n("createPoint.basicInfo")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {tI18n("createPoint.pointName")}
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={tI18n("createPoint.pointNamePlaceholder")}
                      maxLength={100}
                      required
                      className="text-base sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {tI18n("createPoint.description")}
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder={tI18n("createPoint.descriptionPlaceholder")}
                      maxLength={1000}
                      rows={3}
                      className="text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-1 sm:px-0">
              <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
                <h2 className="mb-2 text-base font-semibold text-text-main sm:mb-3 sm:text-lg flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 shrink-0" aria-hidden />
                  {tI18n("createPoint.photosTitle")}
                </h2>
                <p className="mb-3 text-sm text-text-muted">{tI18n("createPoint.photosHint")}</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-text-main transition-colors hover:bg-accent touch-target sm:py-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    className="sr-only"
                    disabled={isSubmitting || photoDrafts.length >= maxPointPhotos}
                    onChange={(e) => {
                      const input = e.currentTarget;
                      const picked =
                        input.files && input.files.length > 0
                          ? Array.from(input.files)
                          : [];
                      if (picked.length) {
                        handlePhotoFilesSelected(picked);
                      }
                      queueMicrotask(() => {
                        input.value = "";
                      });
                    }}
                  />
                  {tI18n("createPoint.pickPhotos")}
                </label>
                <p className="mt-2 text-xs text-text-muted">
                  {tI18n("createPoint.photosCount", {
                    current: photoDrafts.length,
                    max: maxPointPhotos,
                  })}
                </p>
                {photoDrafts.length > 0 && (
                  <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {photoDrafts.map((draft, index) => (
                      <li
                        key={`${draft.previewUrl}-${index}`}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted/30"
                      >
                        <img
                          src={draft.previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhotoDraft(index)}
                          disabled={isSubmitting}
                          className="absolute right-1 top-1 flex min-h-9 min-w-9 items-center justify-center rounded-full bg-background/90 text-text-main shadow border border-border hover:bg-accent"
                          aria-label={tI18n("createPoint.removePhoto")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

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
                      onChange={(e) => setMapStyle(e.target.value as any)}
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
                <div className="aspect-[4/3] w-full overflow-hidden border-y border-border bg-muted/20 sm:rounded-lg sm:border-x">
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
                        {tI18n("createPoint.longitude")}
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
                        {tI18n("createPoint.longitudeExample")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        {tI18n("createPoint.latitude")}
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
                        {tI18n("createPoint.latitudeExample")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-1 sm:px-0">
              <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-text-main mb-4 flex items-center gap-2 sm:text-lg">
                  <Tag className="h-5 w-5 shrink-0" aria-hidden />
                  {tI18n("createPoint.category")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {tI18n("createPoint.selectCategory")}
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange("categoryId", parseInt(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm touch-target sm:min-h-0"
                      required
                    >
                      <option value={0}>{tI18n("createPoint.selectCategoryOption")}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CreateCategoryInline
                    show={showCreateCategory}
                    onToggle={() => setShowCreateCategory(!showCreateCategory)}
                    categoryName={newCategoryName}
                    onCategoryNameChange={setNewCategoryName}
                    categoryColor={newCategoryColor}
                    onCategoryColorChange={setNewCategoryColor}
                    onSubmit={handleCreateCategory}
                    onCancel={() => setShowCreateCategory(false)}
                    mutation={createCategoryMutation}
                  />
                </div>
              </div>
            </div>

            <div className="px-1 sm:px-0">
              <div className="rounded-lg border border-border bg-card p-2 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:gap-2">
                  <h2 className="text-base font-semibold text-text-main flex items-center gap-2 sm:text-lg">
                    <Package className="h-5 w-5 shrink-0" aria-hidden />
                    {tI18n("createPoint.container")}
                  </h2>
                  <div className="group relative sm:ml-1">
                    <HelpCircle className="h-4 w-4 text-text-muted cursor-help" aria-hidden />
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-6 z-10 w-[min(100vw-2rem,20rem)] max-sm:right-0 max-sm:left-auto sm:w-80 p-4 bg-popover border border-border rounded-lg shadow-lg">
                      <p className="font-medium text-sm text-text-main mb-2">
                        {tI18n("createPoint.containerHelpTitle")}
                      </p>
                      <p className="text-sm text-text-muted mb-3">
                        {tI18n("createPoint.containerHelpText")}
                      </p>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium text-text-main mb-1">
                          {tI18n("createPoint.containerVsCategoryTitle")}
                        </p>
                        <p className="text-xs text-text-muted">
                          {tI18n("createPoint.containerVsCategoryText")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {tI18n("createPoint.selectContainer")}
                    </label>
                    <select
                      value={formData.containerId}
                      onChange={(e) => handleInputChange("containerId", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-text-main focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm touch-target sm:min-h-0"
                      required
                    >
                      <option value="">{tI18n("createPoint.selectContainerOption")}</option>
                      {containers.map((container) => (
                        <option key={container.id} value={container.id}>
                          {container.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CreateContainerInline
                    show={showCreateContainer}
                    onToggle={() => setShowCreateContainer(!showCreateContainer)}
                    containerTitle={newContainerTitle}
                    onContainerTitleChange={setNewContainerTitle}
                    containerDescription={newContainerDescription}
                    onContainerDescriptionChange={setNewContainerDescription}
                    onSubmit={handleCreateContainer}
                    onCancel={() => setShowCreateContainer(false)}
                    mutation={createContainerMutation}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-1 sm:flex-row sm:px-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 touch-target w-full sm:w-auto"
              >
                {isSubmitting
                  ? tI18n("createPoint.creating")
                  : tI18n("createPoint.createPointButton")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="touch-target w-full sm:w-auto sm:min-w-[8rem]"
              >
                {tI18n("createPoint.cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
