"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Upload } from "lucide-react";
import { useAuthStore } from "@/shared/lib/store";
import { useProfileQuery } from "@/shared/lib/hooks/queries/use-profile-query";
import {
  useVinlandAssetsQuery,
  useUploadVinlandAssetsMutation,
  useReorderVinlandMutation,
  useUpdateVinlandCaptionMutation,
  useDeleteVinlandAssetMutation,
} from "@/shared/lib/hooks/queries/use-vinland-queries";
import { usePointPhotoCropQueue } from "@/shared/lib/hooks/use-point-photo-crop-queue";
import { VinlandPhotoCropModal } from "@/shared/ui/vinland-photo-crop-modal";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { VinlandAsset } from "@/shared/api/vinland";
import { vinlandImageUrl } from "@/shared/api/vinland";
import { Button, ErrorMessage, Loading, Textarea, BaseModal } from "@/shared/ui";

const MAX_VINLAND_UPLOAD_BATCH = 80;

function VinlandPhotoTileContent({
  asset,
  isAdmin,
  onEdit,
  onDelete,
  dragAttributes,
  dragListeners,
}: {
  asset: VinlandAsset;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: ReturnType<typeof useSortable>["listeners"];
}) {
  const { t } = useTranslation();
  const showHoverOverlay = isAdmin || Boolean(asset.caption?.trim());

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-background shadow-sm dark:border-border dark:bg-background">
      {isAdmin && dragAttributes && dragListeners && (
        <button
          type="button"
          className="absolute left-1.5 top-1.5 z-20 flex h-8 w-8 touch-none items-center justify-center rounded-md border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-opacity hover:bg-black/55"
          aria-label={t("vinland.dragHint")}
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={vinlandImageUrl(asset.url)}
        alt=""
        className="h-full w-full object-cover"
      />
      {showHoverOverlay && (
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
          aria-hidden={!showHoverOverlay}
        >
          {/* только затемнение — не перехватывает клики */}
          <div className="pointer-events-none absolute inset-0 bg-black/55 dark:bg-black/60" />
          <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end p-2 sm:p-3">
            {asset.caption?.trim() ? (
              <p className="pointer-events-none line-clamp-4 text-center text-xs text-white drop-shadow sm:text-sm">
                {asset.caption}
              </p>
            ) : (
              isAdmin && (
                <p className="pointer-events-none text-center text-xs text-white/80">
                  {t("vinland.captionPlaceholder")}
                </p>
              )
            )}
            {isAdmin && (
              <div className="mt-2 flex justify-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-text-main shadow-md transition hover:bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  aria-label={t("vinland.editCaption")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive shadow-md transition hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  aria-label={t("vinland.deleteImage")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortableVinlandTile({
  asset,
  onEdit,
  onDelete,
}: {
  asset: VinlandAsset;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: asset.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style} className="min-w-0 list-none">
      <VinlandPhotoTileContent
        asset={asset}
        isAdmin
        onEdit={onEdit}
        onDelete={onDelete}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </li>
  );
}

function StaticVinlandTile({ asset }: { asset: VinlandAsset }) {
  return (
    <li className="min-w-0 list-none">
      <VinlandPhotoTileContent
        asset={asset}
        isAdmin={false}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </li>
  );
}

export default function VinlandPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { data: profile, isLoading: profileLoading } = useProfileQuery();

  const { data: assets = [], isLoading, error, refetch } = useVinlandAssetsQuery();
  const uploadMutation = useUploadVinlandAssetsMutation();
  const reorderMutation = useReorderVinlandMutation();
  const updateCaptionMutation = useUpdateVinlandCaptionMutation();
  const deleteAssetMutation = useDeleteVinlandAssetMutation();

  const { activeCrop, enqueueFiles, shiftQueue } = usePointPhotoCropQueue();
  const uploadAfterCropRef = useRef<File[]>([]);

  const [editingAsset, setEditingAsset] = useState<VinlandAsset | null>(null);
  const [modalCaption, setModalCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemIds = useMemo(() => assets.map((a) => a.id), [assets]);

  useEffect(() => {
    const run = async () => {
      const ok = await checkAuth();
      if (!ok) {
        router.push("/auth");
      }
    };
    void run();
  }, [checkAuth, router]);

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (activeCrop !== null) return;
    const pending = uploadAfterCropRef.current;
    if (pending.length === 0) return;
    uploadAfterCropRef.current = [];
    uploadMutation.mutate(pending);
  }, [activeCrop, uploadMutation]);

  const handleVinlandCropComplete = (blob: Blob) => {
    const name = `vinland-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now()}.jpg`;
    const file = new File([blob], name, { type: "image/jpeg" });
    uploadAfterCropRef.current.push(file);
    shiftQueue();
  };

  const handleVinlandCropDismiss = () => {
    shiftQueue();
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    enqueueFiles(Array.from(list), {
      maxTotal: MAX_VINLAND_UPLOAD_BATCH,
      currentDraftCount: 0,
    });
    e.target.value = "";
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = assets.findIndex((a) => a.id === active.id);
    const newIndex = assets.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(assets, oldIndex, newIndex);
    reorderMutation.mutate(next.map((a) => a.id));
  };

  const openEditModal = (asset: VinlandAsset) => {
    setEditingAsset(asset);
    setModalCaption(asset.caption ?? "");
  };

  const closeEditModal = () => {
    setEditingAsset(null);
    setModalCaption("");
  };

  const saveCaptionFromModal = () => {
    if (!editingAsset) return;
    const trimmed = modalCaption.trim();
    updateCaptionMutation.mutate(
      { id: editingAsset.id, caption: trimmed.length ? trimmed : null },
      {
        onSuccess: () => {
          closeEditModal();
        },
      },
    );
  };

  const confirmDelete = (asset: VinlandAsset) => {
    if (window.confirm(t("vinland.deleteImage"))) {
      deleteAssetMutation.mutate(asset.id);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const gridClass =
    "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

  const isCropOrUploadBusy =
    uploadMutation.isPending || (isAdmin && activeCrop !== null);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {isAdmin && activeCrop && (
        <VinlandPhotoCropModal
          key={activeCrop.id}
          imageSrc={activeCrop.src}
          onCropComplete={handleVinlandCropComplete}
          onClose={handleVinlandCropDismiss}
        />
      )}
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-text-main sm:text-2xl">{t("vinland.title")}</h1>
          <Link
            href="/profile"
            className="text-sm text-text-muted underline decoration-border underline-offset-4 hover:text-text-main"
          >
            {t("vinland.backToProfile")}
          </Link>
        </div>

        {isAdmin && (
          <div className="mb-6 rounded-xl border border-border bg-surface p-4 dark:border-border dark:bg-surface">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleUploadChange}
            />
            <Button
              type="button"
              variant="default"
              disabled={isCropOrUploadBusy}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? t("vinland.uploading") : t("vinland.upload")}
            </Button>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <ErrorMessage message={t("vinland.loadError")} onRetry={() => refetch()} />
          </div>
        )}

        <BaseModal
          isOpen={editingAsset !== null}
          onClose={closeEditModal}
          title={t("vinland.editCaption")}
          size="sm"
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditModal}>
                {t("common.close")}
              </Button>
              <Button
                type="button"
                variant="default"
                disabled={updateCaptionMutation.isPending}
                onClick={saveCaptionFromModal}
              >
                {t("vinland.saveCaption")}
              </Button>
            </div>
          }
        >
          <Textarea
            value={modalCaption}
            onChange={(e) => setModalCaption(e.target.value)}
            placeholder={t("vinland.captionPlaceholder")}
            rows={5}
            className="text-sm"
          />
        </BaseModal>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        ) : assets.length === 0 ? (
          <p className="py-12 text-center text-text-muted">{t("vinland.empty")}</p>
        ) : isAdmin ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={itemIds} strategy={rectSortingStrategy}>
              <ul className={gridClass}>
                {assets.map((asset) => (
                  <SortableVinlandTile
                    key={asset.id}
                    asset={asset}
                    onEdit={() => openEditModal(asset)}
                    onDelete={() => confirmDelete(asset)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className={gridClass}>
            {assets.map((asset) => (
              <StaticVinlandTile key={asset.id} asset={asset} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
