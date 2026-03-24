'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { pointsApi, type Point } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import { MapPin, Tag, Package, Trash2, Loader2 } from 'lucide-react';

export function ManagePoints() {
  const { t } = useTranslation();
  const { points, pointsLoading, setPoints, setPointsLoading } = useManageStore();

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    setPointsLoading(true);
    try {
      const data = await pointsApi.getAll();
      setPoints(data);
    } catch (err) {
      console.error('Error loading points:', err);
    } finally {
      setPointsLoading(false);
    }
  };

  const handleDeletePoint = async (id: string) => {
    if (!confirm(t('manage.managePoints.deleteConfirm'))) return;
    
    setPointsLoading(true);
    try {
      await pointsApi.delete(id);
      await loadPoints();
      alert(t('manage.managePoints.deleteSuccess'));
    } catch (err: any) {
      console.error('Error deleting point:', err);
      const errorMessage = err.response?.data?.message || t('manage.managePoints.deleteError');
      alert(errorMessage);
    } finally {
      setPointsLoading(false);
    }
  };

  if (pointsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (points.length === 0) {
    return <p className="text-center py-8 text-text-muted">{t('manage.managePoints.noPoints')}</p>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {points.map((point) => (
        <div key={point.id} className="flex items-start sm:items-center justify-between gap-2 p-3 sm:p-4 bg-surface rounded-lg border border-border">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-main text-sm sm:text-base truncate">{point.name}</h3>
            {point.description && (
              <p className="text-xs sm:text-sm text-text-muted mt-1 line-clamp-2">{point.description}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-4 mt-2 text-xs sm:text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{point.category?.name || t('manage.managePoints.noCategory')}</span>
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">{point.container?.title || t('manage.managePoints.noContainer')}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDeletePoint(point.id)}
            className="p-1.5 sm:p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
            title={t('manage.managePoints.delete')}
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
