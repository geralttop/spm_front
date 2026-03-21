'use client';

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { categoriesApi, pointsApi } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import {
  countPointsInVirtualCategory,
  filterManageCategoryList,
  getSystemDefaultCategoryId,
  listPointsInVirtualCategory,
  MANAGE_VIRTUAL_CATEGORY_EXPAND_ID,
} from '../lib/system-default-entities';
import { Tag, Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { CategoryForm } from './CategoryForm';

export function ManageCategories() {
  const { t } = useTranslation();
  const {
    categories,
    categoriesLoading,
    expandedCategories,
    editingCategory,
    showCategoryForm,
    points,
    draggedPoint,
    setCategories,
    setCategoriesLoading,
    toggleCategoryExpand,
    setEditingCategory,
    setShowCategoryForm,
    setDraggedPoint,
    setPoints,
  } = useManageStore();

  const systemCategoryId = useMemo(() => getSystemDefaultCategoryId(categories), [categories]);
  const displayCategories = useMemo(() => filterManageCategoryList(categories), [categories]);
  const virtualCategoryPointsCount = useMemo(
    () => countPointsInVirtualCategory(points, systemCategoryId),
    [points, systemCategoryId]
  );
  const virtualCategoryPoints = useMemo(
    () => listPointsInVirtualCategory(points, systemCategoryId),
    [points, systemCategoryId]
  );
  const isVirtualCategoryExpanded = expandedCategories.has(MANAGE_VIRTUAL_CATEGORY_EXPAND_ID);

  useEffect(() => {
    loadCategories();
    loadPoints();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadPoints = async () => {
    try {
      const data = await pointsApi.getAll();
      setPoints(data);
    } catch (err) {
      console.error('Error loading points:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t('manage.manageCategories.deleteConfirm'))) return;
    
    setCategoriesLoading(true);
    try {
      await categoriesApi.delete(id);
      await loadCategories();
      alert(t('manage.manageCategories.deleteSuccess'));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || t('manage.manageCategories.deleteError'));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setEditingCategory(null);
    setShowCategoryForm(false);
    await loadCategories();
  };

  const handleFormCancel = () => {
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleDragStart = (point: any) => setDraggedPoint(point);
  const handleDragEnd = () => setDraggedPoint(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDropOnCategory = async (categoryId: number | null) => {
    if (!draggedPoint) return;
    const pointEffectivelyNoCategory =
      !draggedPoint.category ||
      (systemCategoryId != null && draggedPoint.category.id === systemCategoryId);
    if (categoryId === null && pointEffectivelyNoCategory) return;
    if (categoryId !== null && draggedPoint.category?.id === categoryId) return;

    setCategoriesLoading(true);
    try {
      await pointsApi.update(draggedPoint.id, { categoryId: categoryId as any });
      await loadPoints();
    } catch (err: any) {
      console.error('Error updating point category:', err);
      alert(err.response?.data?.message || t('manage.manageCategories.moveError'));
    } finally {
      setCategoriesLoading(false);
      setDraggedPoint(null);
    }
  };

  if (categoriesLoading && !showCategoryForm && !editingCategory) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-text-main">{t('manage.manageCategories.title')}</h2>
        {!showCategoryForm && !editingCategory && (
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base self-start xs:self-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('manage.manageCategories.create')}
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          {t('manage.manageCategories.tip')}
        </p>
      </div>

      {(showCategoryForm || editingCategory) && (
        <CategoryForm
          editingCategory={editingCategory}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {categories.length === 0 ? (
        <p className="text-center py-8 text-text-muted">{t('manage.manageCategories.noCategories')}</p>
      ) : (
        <div className="space-y-3">
          {/* Без категории */}
          <div
            className={`bg-surface rounded-lg border-2 transition-colors ${
              draggedPoint &&
              draggedPoint.category !== null &&
              (systemCategoryId == null || draggedPoint.category?.id !== systemCategoryId)
                ? 'border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-950/30'
                : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnCategory(null)}
          >
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleCategoryExpand(MANAGE_VIRTUAL_CATEGORY_EXPAND_ID)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  {isVirtualCategoryExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                  <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-text-main truncate">{t('manage.manageCategories.noCategory')}</h3>
                  {virtualCategoryPointsCount > 0 && (
                    <p className="text-xs text-text-muted mt-0.5 sm:mt-1">
                      {virtualCategoryPointsCount} {t('manage.manageCategories.points')}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex gap-2 w-[88px] shrink-0" aria-hidden />
            </div>

            {isVirtualCategoryExpanded && virtualCategoryPoints.length > 0 && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                {virtualCategoryPoints.map((point) => (
                  <div
                    key={point.id}
                    draggable
                    onDragStart={() => handleDragStart(point)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2 sm:p-3 bg-background rounded border transition-colors ${
                      draggedPoint?.id === point.id
                        ? 'border-primary opacity-50'
                        : 'border-border hover:border-primary cursor-move'
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-text-muted shrink-0 hidden sm:block" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-text-main truncate">{point.name}</p>
                      {point.description && (
                        <p className="text-xs text-text-muted truncate">{point.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-text-muted shrink-0 hidden xs:inline">
                      {point.container?.title || t('manage.manageCategories.noContainer')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isVirtualCategoryExpanded && virtualCategoryPoints.length === 0 && (
              <div className="px-4 pb-4">
                <p className="text-sm text-text-muted text-center py-4">
                  {t('manage.manageCategories.noPointsInCategory')}
                </p>
              </div>
            )}
          </div>

          {displayCategories.map((category) => {
            const categoryPoints = points.filter(p => p.category?.id === category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <div 
                key={category.id} 
                className={`bg-surface rounded-lg border-2 transition-colors ${
                  draggedPoint && draggedPoint.category?.id !== category.id ? 'border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-950/30' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnCategory(category.id)}
              >
                <div className="flex items-center justify-between p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleCategoryExpand(category.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm sm:text-base text-text-main truncate block">{category.name}</span>
                      {categoryPoints.length > 0 && (
                        <p className="text-xs text-text-muted mt-0.5 sm:mt-1">{categoryPoints.length} {t('manage.manageCategories.points')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      disabled={categoryPoints.length > 0}
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {isExpanded && categoryPoints.length > 0 && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                    {categoryPoints.map((point) => (
                      <div
                        key={point.id}
                        draggable
                        onDragStart={() => handleDragStart(point)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-2 sm:p-3 bg-background rounded border transition-colors ${
                          draggedPoint?.id === point.id ? 'border-primary opacity-50' : 'border-border hover:border-primary cursor-move'
                        }`}
                      >
                        <GripVertical className="h-4 w-4 text-text-muted shrink-0 hidden sm:block" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-text-main truncate">{point.name}</p>
                          {point.description && <p className="text-xs text-text-muted truncate">{point.description}</p>}
                        </div>
                        <span className="text-xs text-text-muted shrink-0 hidden xs:inline">
                          {point.container?.title || t('manage.manageCategories.noContainer')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && categoryPoints.length === 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-text-muted text-center py-4">{t('manage.manageCategories.noPointsInCategory')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
