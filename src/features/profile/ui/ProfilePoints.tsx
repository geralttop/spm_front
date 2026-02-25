'use client';

import { MapPin } from 'lucide-react';
import { PointCard } from '@/entities/point';
import type { Point } from '@/shared/types';
import { useTranslation } from '@/shared/lib/hooks';

interface ProfilePointsProps {
  points: Point[];
  loading: boolean;
  onRefetch: () => void;
}

export function ProfilePoints({ points, loading, onRefetch }: ProfilePointsProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-base sm:text-lg font-semibold text-text-main flex items-center gap-2">
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
        {t('profile.myPoints')}
      </h2>

      {loading ? (
        <div className="text-center py-8 text-text-muted">
          {t('profile.pointsLoading')}
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          {t('profile.noPoints')}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {points.map((point) => (
            <PointCard 
              key={point.id} 
              point={point} 
              showAuthor={false}
              onFavoriteChange={onRefetch}
              onPointUpdate={onRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
