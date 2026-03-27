'use client';

import { MapPin } from 'lucide-react';
import { PointCard } from '@/entities/point';
import { PointCardSkeletonList } from '@/shared/ui';
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
    <div className="">
      <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-text-main flex items-center gap-2 px-4 sm:px-0">
        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
        {t('profile.myPoints')}
      </h2>

      {loading ? (
        <PointCardSkeletonList
          ariaLabel={t('profile.pointsLoading')}
          className="px-4 sm:px-0"
        />
      ) : points.length === 0 ? (
        <div className="text-center py-8 text-text-muted px-4 sm:px-0">
          {t('profile.noPoints')}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
          {points.map((point) => (
            <PointCard 
              key={point.id} 
              point={point} 
              onFavoriteChange={onRefetch}
              onPointUpdate={onRefetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
