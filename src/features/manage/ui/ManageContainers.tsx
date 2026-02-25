'use client';

import { useEffect } from 'react';
import { containersApi, pointsApi } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import { Package, Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { ContainerForm } from './ContainerForm';

export function ManageContainers() {
  const {
    containers,
    containersLoading,
    expandedContainers,
    editingContainer,
    showContainerForm,
    points,
    draggedPoint,
    setContainers,
    setContainersLoading,
    toggleContainerExpand,
    setEditingContainer,
    setShowContainerForm,
    setDraggedPoint,
    setPoints,
  } = useManageStore();

  useEffect(() => {
    loadContainers();
    loadPoints();
  }, []);

  const loadContainers = async () => {
    setContainersLoading(true);
    try {
      const data = await containersApi.getAll();
      setContainers(data);
    } catch (err) {
      console.error('Error loading containers:', err);
    } finally {
      setContainersLoading(false);
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

  const handleDeleteContainer = async (id: string) => {
    const pointsCount = points.filter(p => p.container?.id === id).length;
    const confirmMessage = pointsCount > 0
      ? `Удалить этот контейнер? ${pointsCount} точек останутся без контейнера.`
      : 'Удалить этот контейнер?';
    
    if (!confirm(confirmMessage)) return;
    
    setContainersLoading(true);
    try {
      await containersApi.delete(id);
      await loadContainers();
      await loadPoints();
      alert('Контейнер успешно удален');
    } catch (err: any) {
      console.error('Error deleting container:', err);
      alert(err.response?.data?.message || 'Ошибка удаления контейнера');
    } finally {
      setContainersLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setEditingContainer(null);
    setShowContainerForm(false);
    await loadContainers();
  };

  const handleFormCancel = () => {
    setEditingContainer(null);
    setShowContainerForm(false);
  };

  const handleDragStart = (point: any) => setDraggedPoint(point);
  const handleDragEnd = () => setDraggedPoint(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDropOnContainer = async (containerId: string | null) => {
    if (!draggedPoint || draggedPoint.container?.id === containerId) return;

    setContainersLoading(true);
    try {
      await pointsApi.update(draggedPoint.id, { containerId: containerId as any });
      await loadPoints();
    } catch (err: any) {
      console.error('Error updating point container:', err);
      alert(err.response?.data?.message || 'Ошибка перемещения точки');
    } finally {
      setContainersLoading(false);
      setDraggedPoint(null);
    }
  };

  if (containersLoading && !showContainerForm && !editingContainer) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-main">Контейнеры</h2>
        {!showContainerForm && !editingContainer && (
          <button
            onClick={() => setShowContainerForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Создать
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Нажмите на стрелку, чтобы раскрыть список точек. Перетаскивайте точки между контейнерами для изменения.
        </p>
      </div>

      {(showContainerForm || editingContainer) && (
        <ContainerForm
          editingContainer={editingContainer}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {containers.length === 0 ? (
        <p className="text-center py-8 text-text-muted">У вас пока нет контейнеров</p>
      ) : (
        <div className="space-y-3">
          {/* Без контейнера */}
          <div 
            className={`bg-surface rounded-lg border-2 transition-colors ${
              draggedPoint && draggedPoint.container !== null ? 'border-blue-300 bg-blue-50' : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnContainer(null)}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-text-muted" />
                <div>
                  <h3 className="font-medium text-text-main">Без контейнера</h3>
                  <p className="text-xs text-text-muted mt-1">
                    {points.filter(p => !p.container).length} точек
                  </p>
                </div>
              </div>
            </div>
          </div>

          {containers.map((container) => {
            const containerPoints = points.filter(p => p.container?.id === container.id);
            const isExpanded = expandedContainers.has(container.id);
            
            return (
              <div 
                key={container.id} 
                className={`bg-surface rounded-lg border-2 transition-colors ${
                  draggedPoint && draggedPoint.container?.id !== container.id ? 'border-blue-300 bg-blue-50' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnContainer(container.id)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleContainerExpand(container.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-main">{container.title}</h3>
                      {container.description && (
                        <p className="text-sm text-text-muted mt-1">{container.description}</p>
                      )}
                      {containerPoints.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">📍 {containerPoints.length} точек</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingContainer(container)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContainer(container.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {isExpanded && containerPoints.length > 0 && (
                  <div className="px-4 pb-4 space-y-2">
                    {containerPoints.map((point) => (
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
                        <div className="flex items-center gap-2 shrink-0">
                          {point.category && (
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: point.category.color }}
                              title={point.category.name}
                            />
                          )}
                          <span className="text-xs text-text-muted">
                            {point.category?.name || 'Без категории'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && containerPoints.length === 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-text-muted text-center py-4">Нет точек в этом контейнере</p>
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
