"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/hooks";
import { X, Filter, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { FeedPoint } from "@/shared/api/feed";

export interface MapFilters {
  authorIds: number[];
  dateFrom: string;
  dateTo: string;
  categoryIds: number[];
  containerIds: string[];
}

interface AuthorData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  categories: Array<{ id: number; name: string; color: string }>;
  containers: Array<{ id: string; title: string }>;
}

interface MapFiltersProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  allPoints: FeedPoint[];
}

export function MapFiltersComponent({ filters, onFiltersChange, allPoints }: MapFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAuthors, setExpandedAuthors] = useState<Set<number>>(new Set());
  const [authorsData, setAuthorsData] = useState<AuthorData[]>([]);

  // Группируем данные по авторам
  useEffect(() => {
    const authorsMap = new Map<number, AuthorData>();

    allPoints.forEach(point => {
      const authorId = point.author.id;
      
      if (!authorsMap.has(authorId)) {
        authorsMap.set(authorId, {
          id: authorId,
          username: point.author.username,
          firstName: point.author.firstName,
          lastName: point.author.lastName,
          categories: [],
          containers: [],
        });
      }

      const authorData = authorsMap.get(authorId)!;

      // Добавляем категорию, если её ещё нет
      if (point.category && !authorData.categories.find(c => c.id === point.category!.id)) {
        authorData.categories.push({
          id: point.category.id,
          name: point.category.name,
          color: point.category.color,
        });
      }

      // Добавляем контейнер, если его ещё нет
      if (point.container && !authorData.containers.find(c => c.id === point.container!.id)) {
        authorData.containers.push({
          id: point.container.id,
          title: point.container.title,
        });
      }
    });

    const authors = Array.from(authorsMap.values());
    setAuthorsData(authors);

    // Инициализируем фильтры - выбираем всех авторов, все категории и все контейнеры
    if (filters.authorIds.length === 0 && filters.categoryIds.length === 0 && filters.containerIds.length === 0) {
      const allAuthorIds = authors.map(a => a.id);
      const allCategoryIds = Array.from(new Set(authors.flatMap(a => a.categories.map(c => c.id))));
      const allContainerIds = Array.from(new Set(authors.flatMap(a => a.containers.map(c => c.id))));
      
      onFiltersChange({
        ...filters,
        authorIds: allAuthorIds,
        categoryIds: allCategoryIds,
        containerIds: allContainerIds,
      });
    }
  }, [allPoints]);

  const toggleAuthorExpanded = (authorId: number) => {
    const newExpanded = new Set(expandedAuthors);
    if (newExpanded.has(authorId)) {
      newExpanded.delete(authorId);
    } else {
      newExpanded.add(authorId);
    }
    setExpandedAuthors(newExpanded);
  };

  const handleAuthorToggle = (authorId: number) => {
    const author = authorsData.find(a => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.authorIds.includes(authorId);
    
    if (isCurrentlySelected) {
      // Убираем автора и все его категории и контейнеры
      const newAuthorIds = filters.authorIds.filter(id => id !== authorId);
      const authorCategoryIds = author.categories.map(c => c.id);
      const authorContainerIds = author.containers.map(c => c.id);
      
      const newCategoryIds = filters.categoryIds.filter(id => !authorCategoryIds.includes(id));
      const newContainerIds = filters.containerIds.filter(id => !authorContainerIds.includes(id));
      
      onFiltersChange({
        ...filters,
        authorIds: newAuthorIds,
        categoryIds: newCategoryIds,
        containerIds: newContainerIds,
      });
    } else {
      // Добавляем автора и все его категории и контейнеры
      const newAuthorIds = [...filters.authorIds, authorId];
      const authorCategoryIds = author.categories.map(c => c.id);
      const authorContainerIds = author.containers.map(c => c.id);
      
      const newCategoryIds = [...new Set([...filters.categoryIds, ...authorCategoryIds])];
      const newContainerIds = [...new Set([...filters.containerIds, ...authorContainerIds])];
      
      onFiltersChange({
        ...filters,
        authorIds: newAuthorIds,
        categoryIds: newCategoryIds,
        containerIds: newContainerIds,
      });
    }
  };

  const handleCategoryToggle = (categoryId: number, authorId: number) => {
    const author = authorsData.find(a => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.categoryIds.includes(categoryId);
    const isAuthorSelected = filters.authorIds.includes(authorId);
    
    if (isCurrentlySelected) {
      // Убираем категорию
      const newCategoryIds = filters.categoryIds.filter(id => id !== categoryId);
      
      // Проверяем, остались ли у автора выбранные категории или контейнеры
      const authorCategoryIds = author.categories.map(c => c.id);
      const authorContainerIds = author.containers.map(c => c.id);
      
      const hasSelectedCategories = authorCategoryIds.some(id => 
        id !== categoryId && newCategoryIds.includes(id)
      );
      const hasSelectedContainers = authorContainerIds.some(id => 
        filters.containerIds.includes(id)
      );
      
      // Если у автора не осталось выбранных категорий и контейнеров, убираем автора
      if (!hasSelectedCategories && !hasSelectedContainers) {
        const newAuthorIds = filters.authorIds.filter(id => id !== authorId);
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          categoryIds: newCategoryIds,
        });
      } else {
        onFiltersChange({ ...filters, categoryIds: newCategoryIds });
      }
    } else {
      // Добавляем категорию
      const newCategoryIds = [...filters.categoryIds, categoryId];
      
      // Если автор не выбран, добавляем его
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
  };

  const handleContainerToggle = (containerId: string, authorId: number) => {
    const author = authorsData.find(a => a.id === authorId);
    if (!author) return;

    const isCurrentlySelected = filters.containerIds.includes(containerId);
    const isAuthorSelected = filters.authorIds.includes(authorId);
    
    if (isCurrentlySelected) {
      // Убираем контейнер
      const newContainerIds = filters.containerIds.filter(id => id !== containerId);
      
      // Проверяем, остались ли у автора выбранные категории или контейнеры
      const authorCategoryIds = author.categories.map(c => c.id);
      const authorContainerIds = author.containers.map(c => c.id);
      
      const hasSelectedCategories = authorCategoryIds.some(id => 
        filters.categoryIds.includes(id)
      );
      const hasSelectedContainers = authorContainerIds.some(id => 
        id !== containerId && newContainerIds.includes(id)
      );
      
      // Если у автора не осталось выбранных категорий и контейнеров, убираем автора
      if (!hasSelectedCategories && !hasSelectedContainers) {
        const newAuthorIds = filters.authorIds.filter(id => id !== authorId);
        onFiltersChange({
          ...filters,
          authorIds: newAuthorIds,
          containerIds: newContainerIds,
        });
      } else {
        onFiltersChange({ ...filters, containerIds: newContainerIds });
      }
    } else {
      // Добавляем контейнер
      const newContainerIds = [...filters.containerIds, containerId];
      
      // Если автор не выбран, добавляем его
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
  };

  const handleDateFromChange = (date: string) => {
    onFiltersChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: string) => {
    onFiltersChange({ ...filters, dateTo: date });
  };

  const clearFilters = () => {
    onFiltersChange({
      authorIds: [],
      dateFrom: "",
      dateTo: "",
      categoryIds: [],
      containerIds: [],
    });
  };

  const activeFiltersCount = 
    filters.authorIds.length + 
    filters.categoryIds.length + 
    filters.containerIds.length +
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  return (
    <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-2 z-10 w-auto max-w-[min(20rem,calc(100vw-6rem))] min-w-0 sm:bottom-4 sm:left-4">
      {/* Кнопка фильтров — FAB внизу слева (как в типичных карт-приложениях) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg transition-colors hover:bg-accent touch-manipulation sm:inline-flex sm:w-auto sm:min-w-0 sm:justify-start"
        aria-expanded={isOpen}
        aria-controls="map-filters-panel"
      >
        <Filter className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
        <span className="min-w-0 truncate text-sm font-medium">{t("map.filters")}</span>
        {activeFiltersCount > 0 && (
          <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 transition-transform sm:inline ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {/* Затемнение под панелью на мобильных */}
      {isOpen && (
        <button
          type="button"
          aria-label={t("map.closeFilters")}
          className="fixed bottom-0 left-0 right-0 top-14 z-[45] bg-black/50 sm:top-16 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Панель: мобильные — шторка снизу; sm+ — над кнопкой */}
      {isOpen && (
        <div
          id="map-filters-panel"
          className="fixed inset-x-0 bottom-0 z-[48] flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-2 sm:max-h-[min(70vh,calc(100vh-12rem))] sm:w-80 sm:rounded-lg sm:pb-0"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-main">{t('map.filters')}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition-colors hover:bg-accent touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Фильтр по авторам с их категориями и контейнерами */}
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 block">
                {t('map.filterByAuthor')}
              </label>
              
              {authorsData.length === 0 ? (
                <p className="text-xs text-text-muted">{t('map.noAuthors')}</p>
              ) : (
                <div className="space-y-1">
                  {authorsData.map((author) => (
                    <div key={author.id} className="border border-border rounded-md overflow-hidden">
                      {/* Автор */}
                      <div className="flex items-center gap-2 p-2 bg-accent/50">
                        <button
                          onClick={() => toggleAuthorExpanded(author.id)}
                          className="p-0.5 hover:bg-accent rounded transition-colors"
                        >
                          {expandedAuthors.has(author.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                        <label className="flex items-center gap-2 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.authorIds.includes(author.id)}
                            onChange={() => handleAuthorToggle(author.id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-text-main font-medium">
                            {author.username}
                          </span>
                        </label>
                      </div>

                      {/* Категории и контейнеры автора */}
                      {expandedAuthors.has(author.id) && (
                        <div className="p-2 space-y-2 bg-background/50">
                          {/* Категории */}
                          {author.categories.length > 0 && (
                            <div>
                              <p className="text-xs text-text-muted mb-1">{t('map.categories')}</p>
                              <div className="space-y-1 pl-2">
                                {author.categories.map((category) => (
                                  <label
                                    key={category.id}
                                    className="flex items-center gap-2 p-1 hover:bg-accent rounded cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filters.categoryIds.includes(category.id)}
                                      onChange={() => handleCategoryToggle(category.id, author.id)}
                                      className="rounded border-border text-primary focus:ring-primary"
                                    />
                                    <div
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="text-xs text-text-main">{category.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Контейнеры */}
                          {author.containers.length > 0 && (
                            <div>
                              <p className="text-xs text-text-muted mb-1">{t('map.containers')}</p>
                              <div className="space-y-1 pl-2">
                                {author.containers.map((container) => (
                                  <label
                                    key={container.id}
                                    className="flex items-center gap-2 p-1 hover:bg-accent rounded cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filters.containerIds.includes(container.id)}
                                      onChange={() => handleContainerToggle(container.id, author.id)}
                                      className="rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs text-text-main">{container.title}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Фильтр по дате */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-text-muted" />
                <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {t('map.filterByDate')}
                </label>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">
                    {t('map.dateFrom')}
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="w-full bg-background text-text-main border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-text-muted mb-1 block">
                    {t('map.dateTo')}
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="w-full bg-background text-text-main border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Кнопка сброса */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-accent hover:text-text-main"
              >
                {t("map.clearFilters")}
              </button>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
