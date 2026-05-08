'use client';

import Link from "next/link";
import { ChevronDown, ChevronRight, Map as MapIcon, MapPin, Package, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { PointCard } from '@/shared/ui/point-card';
import { PointCardSkeletonList } from '@/shared/ui';
import type { Point } from '@/shared/types';
import { useTranslation } from '@/shared/lib/hooks';
import { filterManageCategoryList, filterManageContainerList, getSystemDefaultCategoryId, getSystemDefaultContainerId, listPointsInVirtualCategory, listPointsInVirtualContainer, MANAGE_VIRTUAL_CATEGORY_EXPAND_ID, MANAGE_VIRTUAL_CONTAINER_EXPAND_ID, SEED_SYSTEM_CATEGORY_NAME, SEED_SYSTEM_CONTAINER_TITLE } from "@/features/manage/lib/system-default-entities";

interface ProfilePointsProps {
  points: Point[];
  loading: boolean;
  onRefetch: () => void;
  title?: string;
}

type ProfilePointsViewMode = "flat" | "grouped";

export function ProfilePoints({ points, loading, onRefetch, title }: ProfilePointsProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ProfilePointsViewMode>("flat");
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(
    () => new Set()
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    () => new Set()
  );

  const systemContainerId = useMemo(() => {
    const containers = points
      .map((p) => p.container)
      .filter(Boolean)
      .map((c) => ({
        id: c!.id,
        title: c!.title,
        authorId: (c as any)?.authorId,
      }));
    return getSystemDefaultContainerId(containers);
  }, [points]);

  const systemCategoryId = useMemo(() => {
    const categories = points
      .map((p) => p.category)
      .filter(Boolean)
      .map((c) => ({
        id: c!.id,
        name: c!.name,
        authorId: (c as any)?.authorId,
      }));
    return getSystemDefaultCategoryId(categories);
  }, [points]);

  const allContainers = useMemo(() => {
    const map = new Map<string, { id: string; title: string; color?: string; authorId?: number | null }>();
    for (const p of points) {
      const c = p.container;
      if (!c) continue;
      if (!map.has(c.id)) {
        map.set(c.id, {
          id: c.id,
          title: c.title,
          color: (c as any)?.color,
          authorId: (c as any)?.authorId,
        });
      }
    }
    const list = Array.from(map.values());
    return filterManageContainerList(list).sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
  }, [points]);

  const allCategories = useMemo(() => {
    const map = new Map<number, { id: number; name: string; color?: string; authorId?: number | null }>();
    for (const p of points) {
      const c = p.category;
      if (!c) continue;
      if (!map.has(c.id)) {
        map.set(c.id, {
          id: c.id,
          name: c.name,
          color: (c as any)?.color,
          authorId: (c as any)?.authorId,
        });
      }
    }
    const list = Array.from(map.values());
    return filterManageCategoryList(list).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [points]);

  const containerGroups = useMemo(() => {
    const noContainerPoints = listPointsInVirtualContainer(points as any, systemContainerId);
    const groups: Array<{
      id: string;
      title: string;
      points: Point[];
      isVirtual: boolean;
    }> = [
      {
        id: MANAGE_VIRTUAL_CONTAINER_EXPAND_ID,
        title: t("profile.grouped.noContainer", { defaultValue: SEED_SYSTEM_CONTAINER_TITLE }),
        points: noContainerPoints,
        isVirtual: true,
      },
      ...allContainers.map((c) => ({
        id: c.id,
        title: c.title,
        points: points.filter((p) => p.container?.id === c.id),
        isVirtual: false,
      })),
    ];
    return groups.filter((g) => g.points.length > 0);
  }, [points, systemContainerId, allContainers, t]);

  const toggleContainer = (id: string) => {
    setExpandedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="">
      <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-text-main flex items-center gap-2 px-4 sm:px-0">
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
        {title ?? t("profile.myPoints")}
      </h2>

      <div className="mb-3 flex items-center gap-2 px-4 sm:px-0">
        <button
          type="button"
          onClick={() => setViewMode("flat")}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "flat"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-text-muted hover:bg-accent hover:text-text-main"
          }`}
        >
          {t("profile.pointsView.flat")}
        </button>
        <button
          type="button"
          onClick={() => setViewMode("grouped")}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "grouped"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-text-muted hover:bg-accent hover:text-text-main"
          }`}
        >
          {t("profile.pointsView.grouped")}
        </button>
      </div>

      {loading ? (
        <PointCardSkeletonList
          ariaLabel={t('profile.pointsLoading')}
          className="px-4 sm:px-0"
        />
      ) : points.length === 0 ? (
        <div className="text-center py-8 text-text-muted px-4 sm:px-0">
          {t('profile.noPoints')}
        </div>
      ) : viewMode === "flat" ? (
        <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
          {points.map((point) => (
            <PointCard
              key={point.id}
              point={point as any}
              onFavoriteChange={onRefetch}
              onPointUpdate={onRefetch}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4 px-4 sm:px-0">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 text-sm font-semibold text-text-main sm:px-4">
              <Package className="h-4 w-4 text-text-muted" aria-hidden />
              {t("profile.grouped.containersTitle")}
            </div>
            <div className="divide-y divide-border">
              {containerGroups.map((g) => {
                const isExpanded = expandedContainers.has(g.id);
                const mapHref = g.isVirtual
                  ? null
                  : `/map?container=${encodeURIComponent(g.id)}`;
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
                      <button
                        type="button"
                        onClick={() => toggleContainer(g.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-accent"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-text-muted" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-muted" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-main">
                          {g.title}
                        </span>
                        <span className="shrink-0 text-xs text-text-muted">
                          {g.points.length}
                        </span>
                      </button>
                      {mapHref ? (
                        <Link
                          href={mapHref}
                          prefetch={false}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          title={t("map.openOnMap")}
                          aria-label={t("map.openOnMap")}
                        >
                          <MapIcon className="h-4 w-4" aria-hidden />
                        </Link>
                      ) : null}
                    </div>
                    {isExpanded ? (
                      <div className="space-y-4 px-0 pb-3 sm:px-0">
                        <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
                          {g.points.map((p) => (
                            <PointCard
                              key={p.id}
                              point={p as any}
                              onFavoriteChange={onRefetch}
                              onPointUpdate={onRefetch}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 text-sm font-semibold text-text-main sm:px-4">
              <Tag className="h-4 w-4 text-text-muted" aria-hidden />
              {t("profile.grouped.categoriesTitle")}
            </div>
            <div className="divide-y divide-border">
              {(() => {
                const noCategoryPoints = listPointsInVirtualCategory(points as any, systemCategoryId);
                const groups: Array<{
                  id: number;
                  title: string;
                  points: Point[];
                  isVirtual: boolean;
                }> = [
                  {
                    id: MANAGE_VIRTUAL_CATEGORY_EXPAND_ID,
                    title: t("profile.grouped.noCategory", { defaultValue: SEED_SYSTEM_CATEGORY_NAME }),
                    points: noCategoryPoints,
                    isVirtual: true,
                  },
                  ...allCategories.map((c) => ({
                    id: c.id,
                    title: c.name,
                    points: points.filter((p) => p.category?.id === c.id),
                    isVirtual: false,
                  })),
                ].filter((g) => g.points.length > 0);

                return groups.map((g) => {
                  const isExpanded = expandedCategories.has(g.id);
                  const mapHref = g.isVirtual
                    ? null
                    : `/map?category=${encodeURIComponent(String(g.id))}`;
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4">
                        <button
                          type="button"
                          onClick={() => toggleCategory(g.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-accent"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-text-muted" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-text-muted" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-main">
                            {g.title}
                          </span>
                          <span className="shrink-0 text-xs text-text-muted">
                            {g.points.length}
                          </span>
                        </button>
                        {mapHref ? (
                          <Link
                            href={mapHref}
                            prefetch={false}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            title={t("map.openOnMap")}
                            aria-label={t("map.openOnMap")}
                          >
                            <MapIcon className="h-4 w-4" aria-hidden />
                          </Link>
                        ) : null}
                      </div>
                      {isExpanded ? (
                        <div className="space-y-4 px-0 pb-3 sm:px-0">
                          <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
                            {g.points.map((p) => (
                              <PointCard
                                key={p.id}
                                point={p as any}
                                onFavoriteChange={onRefetch}
                                onPointUpdate={onRefetch}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
