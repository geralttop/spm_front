'use client';

import { useEffect } from 'react';
import { pointsApi, type Point } from '@/shared/api';
import { useManageStore } from '@/shared/lib/store';
import { MapPin, Tag, Package, Trash2, Loader2 } from 'lucide-react';

export function ManagePoints() {
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
    if (!confirm('Удалить эту точку?')) return;
    
    setPointsLoading(true);
    try {
      await pointsApi.delete(id);
      await loadPoints();
      alert('Точка успешно удалена');
    } catch (err: any) {
      console.error('Error deleting point:', err);
      const errorMessage = err.response?.data?.message || 'Ошибка удаления точки';
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
    return <p className="text-center py-8 text-text-muted">У вас пока нет точек</p>;
  }

  return (
    <div className="space-y-4">
      {points.map((point) => (
        <div key={point.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
          <div className="flex-1">
            <h3 className="font-medium text-text-main">{point.name}</h3>
            {point.description && (
              <p className="text-sm text-text-muted mt-1">{point.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-text-muted">
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {point.category?.name || 'Без категории'}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {point.container?.title || 'Без контейнера'}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDeletePoint(point.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Удалить"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
