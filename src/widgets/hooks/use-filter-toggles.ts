import { useCallback } from "react";
import type { AuthorData } from "@/widgets/hooks/use-authors-from-points";

export interface MapFilters {
  authorIds: number[];
  dateFrom: string;
  dateTo: string;
  categoryIds: number[];
  containerIds: string[];
}

export function useFilterToggles(
  authorsData: AuthorData[],
  filters: MapFilters,
  onFiltersChange: (filters: MapFilters) => void
) {
  const handleAuthorToggle = useCallback((authorId: number) => {
    const author = authorsData.find((a) => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.authorIds.includes(authorId);

    if (isCurrentlySelected) {
      const newAuthorIds = filters.authorIds.filter((id) => id !== authorId);
      const authorCategoryIds = author.categories.map((c) => c.id);
      const authorContainerIds = author.containers.map((c) => c.id);

      const newCategoryIds = filters.categoryIds.filter(
        (id) => !authorCategoryIds.includes(id)
      );
      const newContainerIds = filters.containerIds.filter(
        (id) => !authorContainerIds.includes(id)
      );

      onFiltersChange({
        ...filters,
        authorIds: newAuthorIds,
        categoryIds: newCategoryIds,
        containerIds: newContainerIds,
      });
    } else {
      const newAuthorIds = [...filters.authorIds, authorId];
      const authorCategoryIds = author.categories.map((c) => c.id);
      const authorContainerIds = author.containers.map((c) => c.id);

      const newCategoryIds = [
        ...new Set([...filters.categoryIds, ...authorCategoryIds]),
      ];
      const newContainerIds = [
        ...new Set([...filters.containerIds, ...authorContainerIds]),
      ];

      onFiltersChange({
        ...filters,
        authorIds: newAuthorIds,
        categoryIds: newCategoryIds,
        containerIds: newContainerIds,
      });
    }
  }, [authorsData, filters, onFiltersChange]);

  const handleCategoryToggle = useCallback((categoryId: number, authorId: number) => {
    const author = authorsData.find((a) => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.categoryIds.includes(categoryId);
    const isAuthorSelected = filters.authorIds.includes(authorId);

    if (isCurrentlySelected) {
      const newCategoryIds = filters.categoryIds.filter(
        (id) => id !== categoryId
      );

      const authorCategoryIds = author.categories.map((c) => c.id);
      const authorContainerIds = author.containers.map((c) => c.id);

      const hasSelectedCategories = authorCategoryIds.some(
        (id) => id !== categoryId && newCategoryIds.includes(id)
      );
      const hasSelectedContainers = authorContainerIds.some((id) =>
        filters.containerIds.includes(id)
      );

      if (!hasSelectedCategories && !hasSelectedContainers) {
        const newAuthorIds = filters.authorIds.filter((id) => id !== authorId);
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          categoryIds: newCategoryIds,
        });
      } else {
        onFiltersChange({ ...filters, categoryIds: newCategoryIds });
      }
    } else {
      const newCategoryIds = [...filters.categoryIds, categoryId];

      if (!isAuthorSelected) {
        const newAuthorIds = [...filters.authorIds, authorId];
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          categoryIds: newCategoryIds,
        });
      } else {
        onFiltersChange({ ...filters, categoryIds: newCategoryIds });
      }
    }
  }, [authorsData, filters, onFiltersChange]);

  const handleContainerToggle = useCallback((containerId: string, authorId: number) => {
    const author = authorsData.find((a) => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.containerIds.includes(containerId);
    const isAuthorSelected = filters.authorIds.includes(authorId);

    if (isCurrentlySelected) {
      const newContainerIds = filters.containerIds.filter(
        (id) => id !== containerId
      );

      const authorCategoryIds = author.categories.map((c) => c.id);
      const authorContainerIds = author.containers.map((c) => c.id);

      const hasSelectedCategories = authorCategoryIds.some((id) =>
        filters.categoryIds.includes(id)
      );
      const hasSelectedContainers = authorContainerIds.some(
        (id) => id !== containerId && newContainerIds.includes(id)
      );

      if (!hasSelectedCategories && !hasSelectedContainers) {
        const newAuthorIds = filters.authorIds.filter((id) => id !== authorId);
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          containerIds: newContainerIds,
        });
      } else {
        onFiltersChange({ ...filters, containerIds: newContainerIds });
      }
    } else {
      const newContainerIds = [...filters.containerIds, containerId];

      if (!isAuthorSelected) {
        const newAuthorIds = [...filters.authorIds, authorId];
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          containerIds: newContainerIds,
        });
      } else {
        onFiltersChange({ ...filters, containerIds: newContainerIds });
      }
    }
  }, [authorsData, filters, onFiltersChange]);

  return { handleAuthorToggle, handleCategoryToggle, handleContainerToggle };
}
