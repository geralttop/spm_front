'use client';

import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { containersApi, pointsApi } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import {
  countPointsInVirtualContainer,
  filterManageContainerList,
  getSystemDefaultContainerId,
  listPointsInVirtualContainer,
  MANAGE_VIRTUAL_CONTAINER_EXPAND_ID,
} from '../lib/system-default-entities';
import { Package, Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { ContainerForm } from './ContainerForm';

export function ManageContainers() {
  const { t } = useTranslation();
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

  const systemContainerId = useMemo(() => getSystemDefaultContainerId(containers), [containers]);
  const displayContainers = useMemo(() => filterManageContainerList(containers), [containers]);
  const virtualContainerPointsCount = useMemo(
    () => countPointsInVirtualContainer(points, systemContainerId),
    [points, systemContainerId]
  );
  const virtualContainerPoints = useMemo(
    () => listPointsInVirtualContainer(points, systemContainerId),
    [points, systemContainerId]
  );
  const isVirtualContainerExpanded = expandedContainers.has(MANAGE_VIRTUAL_CONTAINER_EXPAND_ID);

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
      ? t('manage.manageContainers.deleteConfirmWithPoints', { count: pointsCount })
      : t('manage.manageContainers.deleteConfirm');
    
    if (!confirm(confirmMessage)) return;
    
    setContainersLoading(true);
    try {
      await containersApi.delete(id);
      await loadContainers();
      await loadPoints();
      alert(t('manage.manageContainers.deleteSuccess'));
    } catch (err: any) {
      console.error('Error deleting container:', err);
      alert(err.response?.data?.message || t('manage.manageContainers.deleteError'));
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
    if (!draggedPoint) return;
    const pointEffectivelyNoContainer =
      !draggedPoint.container ||
      (systemContainerId != null && draggedPoint.container.id === systemContainerId);
    if (containerId === null && pointEffectivelyNoContainer) return;
    if (containerId !== null && draggedPoint.container?.id === containerId) return;

    setContainersLoading(true);
    try {
      await pointsApi.update(draggedPoint.id, { containerId: containerId as any });
      await loadPoints();
    } catch (err: any) {
      console.error('Error updating point container:', err);
      alert(err.response?.data?.message || t('manage.manageContainers.moveError'));
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
      <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-text-main">{t('manage.manageContainers.title')}</h2>
        {!showContainerForm && !editingContainer && (
          <button
            onClick={() => setShowContainerForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base self-start xs:self-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('manage.manageContainers.create')}
          </button>
        )}
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          {t('manage.manageContainers.tip')}
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
        <p className="text-center py-8 text-text-muted">{t('manage.manageContainers.noContainers')}</p>
      ) : (
        <div className="space-y-3">
          {/* Без контейнера / общий виртуальный блок */}
          <div
            className={`bg-surface rounded-lg border-2 transition-colors ${
              draggedPoint &&
              draggedPoint.container !== null &&
              (systemContainerId == null || draggedPoint.container?.id !== systemContainerId)
                ? 'border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-950/30'
                : 'border-border'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDropOnContainer(null)}
          >
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleContainerExpand(MANAGE_VIRTUAL_CONTAINER_EXPAND_ID)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  {isVirtualContainerExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-text-main truncate">{t('manage.manageContainers.noContainer')}</h3>
                  {virtualContainerPointsCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                      📍 {virtualContainerPointsCount} {t('manage.manageContainers.points')}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex gap-2 w-[88px] shrink-0" aria-hidden />
            </div>

            {isVirtualContainerExpanded && virtualContainerPoints.length > 0 && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                {virtualContainerPoints.map((point) => (
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
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 hidden xs:flex">
                      {point.category && (
                        <div
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                          style={{ backgroundColor: point.category.color }}
                          title={point.category.name}
                        />
                      )}
                      <span className="text-xs text-text-muted">
                        {point.category?.name || t('manage.manageContainers.noCategory')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isVirtualContainerExpanded && virtualContainerPoints.length === 0 && (
              <div className="px-4 pb-4">
                <p className="text-sm text-text-muted text-center py-4">
                  {t('manage.manageContainers.noPointsInContainer')}
                </p>
              </div>
            )}
          </div>

          {displayContainers.map((container) => {
            const containerPoints = points.filter(p => p.container?.id === container.id);
            const isExpanded = expandedContainers.has(container.id);
            
            return (
              <div 
                key={container.id} 
                className={`bg-surface rounded-lg border-2 transition-colors ${
                  draggedPoint && draggedPoint.container?.id !== container.id ? 'border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-950/30' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnContainer(container.id)}
              >
                <div className="flex items-center justify-between p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleContainerExpand(container.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: container.color }}
                      title={container.color}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-text-main truncate">{container.title}</h3>
                      {container.description && (
                        <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">{container.description}</p>
                      )}
                      {containerPoints.length > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">📍 {containerPoints.length} {t('manage.manageContainers.points')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={() => setEditingContainer(container)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContainer(container.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                {isExpanded && containerPoints.length > 0 && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                    {containerPoints.map((point) => (
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
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 hidden xs:flex">
                          {point.category && (
                            <div
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                              style={{ backgroundColor: point.category.color }}
                              title={point.category.name}
                            />
                          )}
                          <span className="text-xs text-text-muted">
                            {point.category?.name || t('manage.manageContainers.noCategory')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && containerPoints.length === 0 && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-text-muted text-center py-4">{t('manage.manageContainers.noPointsInContainer')}</p>
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
