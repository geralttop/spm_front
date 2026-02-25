'use client';

import { useEffect } from 'react';
import { categoriesApi, pointsApi } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import { Tag, Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { CategoryForm } from './CategoryForm';

export function ManageCategories() {
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
    if (!confirm('Удалить эту категорию? Если она используется в точках, удаление будет невозможно.')) return;
    
    setCategoriesLoading(true);
    try {
      await categoriesApi.delete(id);
      await loadCategories();
      alert('Категория успешно удалена');
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Ошибка удаления категории');
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
    if (!draggedPoint || draggedPoint.category?.id === categoryId) return;

    setCategoriesLoading(true);
    try {
      await pointsApi.update(draggedPoint.id, { categoryId: categoryId as any });
      await loadPoints();
    } catch (err: any) {
      console.error('Error updating point category:', err);
      alert(err.response?.data?.message || 'Ошибка перемещения точки');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-main">Категории</h2>
        {!showCategoryForm && !editingCategory && (
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Создать
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Нажмите на стрелку, чтобы раскрыть список точек. Перетаскивайте точки между категориями для изменения.
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
        <p className="text-center py-8 text-text-muted">У вас пока нет категорий</p>
      ) : (
        <div className="space-y-3">
          {/* Без категории */}
          <div 
            className={`bg-surface rounded-lg border-2 transition-colors ${
              draggedPoint && draggedPoint.category !== null ? 'border-blue-300 bg-blue-50' : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnCategory(null)}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <Tag className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-text-main">Без категории</h3>
                  <p className="text-xs text-text-muted mt-1">
                    {points.filter(p => !p.category).length} точек
                  </p>
                </div>
              </div>
            </div>
          </div>

          {categories.map((category) => {
            const categoryPoints = points.filter(p => p.category?.id === category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <div 
                key={category.id} 
                className={`bg-surface rounded-lg border-2 transition-colors ${
                  draggedPoint && draggedPoint.category?.id !== category.id ? 'border-blue-300 bg-blue-50' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnCategory(category.id)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleCategoryExpand(category.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: category.color }} />
                    <div className="flex-1">
                      <span className="font-medium text-text-main">{category.name}</span>
                      {categoryPoints.length > 0 && (
                        <p className="text-xs text-text-muted mt-1">{categoryPoints.length} точек</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={categoryPoints.length > 0}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {isExpanded && categoryPoints.length > 0 && (
                  <div className="px-4 pb-4 space-y-2">
                    {categoryPoints.map((point) => (
                      <div
                        key={point.id}
                        draggable
                        onDragStart={() => handleDragStart(point)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-3 bg-background rounded border transition-colors ${
                          draggedPoint?.id === point.id ? 'border-primary opacity-50' : 'border-border hover:border-primary cursor-move'
                        }`}
                      >
                        <GripVertical className="h-4 w-4 text-text-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-text-main truncate">{point.name}</p>
                          {point.description && <p className="text-xs text-text-muted truncate">{point.description}</p>}
                        </div>
                        <span className="text-xs text-text-muted shrink-0">
                          {point.container?.title || 'Без контейнера'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && categoryPoints.length === 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-text-muted text-center py-4">Нет точек в этой категории</p>
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
