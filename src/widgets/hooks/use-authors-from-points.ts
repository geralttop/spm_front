import { useMemo, useEffect, useRef } from "react";
import type { FeedPoint } from "@/shared/api/feed";
import type { MapFilters } from "@/widgets/hooks/use-filter-toggles";

export interface AuthorData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdPointsCount?: number;
  categories: Array<{ id: number; name: string; color: string }>;
  containers: Array<{ id: string; title: string }>;
}

export function useAuthorsFromPoints(
  allPoints: FeedPoint[],
  filters: MapFilters,
  onFiltersChange: (filters: MapFilters) => void
): AuthorData[] {
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  const authorsData = useMemo(() => {
    const authorsMap = new Map<number, AuthorData>();

    allPoints.forEach((point) => {
      const authorId = point.author.id;

      if (!authorsMap.has(authorId)) {
        authorsMap.set(authorId, {
          id: authorId,
          username: point.author.username,
          firstName: point.author.firstName,
          lastName: point.author.lastName,
          role: point.author.role,
          createdPointsCount: point.author.createdPointsCount,
          categories: [],
          containers: [],
        });
      }

      const authorData = authorsMap.get(authorId)!;

      if (
        point.category &&
        !authorData.categories.find((c) => c.id === point.category!.id)
      ) {
        authorData.categories.push({
          id: point.category.id,
          name: point.category.name,
          color: point.category.color,
        });
      }

      if (
        point.container &&
        !authorData.containers.find((c) => c.id === point.container!.id)
      ) {
        authorData.containers.push({
          id: point.container.id,
          title: point.container.title,
        });
      }
    });

    return Array.from(authorsMap.values());
  }, [allPoints]);

  useEffect(() => {
    const currentFilters = filtersRef.current;
    if (
      currentFilters.authorIds.length === 0 &&
      currentFilters.categoryIds.length === 0 &&
      currentFilters.containerIds.length === 0
    ) {
      const allAuthorIds = authorsData.map((a) => a.id);
      const allCategoryIds = Array.from(
        new Set(authorsData.flatMap((a) => a.categories.map((c) => c.id)))
      );
      const allContainerIds = Array.from(
        new Set(authorsData.flatMap((a) => a.containers.map((c) => c.id)))
      );

      onFiltersChangeRef.current({
        ...currentFilters,
        authorIds: allAuthorIds,
        categoryIds: allCategoryIds,
        containerIds: allContainerIds,
      });
    }
  }, [authorsData]);

  return authorsData;
}
