'use client';

import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SubscriptionStats } from '@/shared/types';

interface ProfileStatsProps {
  stats: SubscriptionStats;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

export function ProfileStats({ stats, onShowFollowers, onShowFollowing }: ProfileStatsProps) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:flex sm:w-auto">
      <button
        type="button"
        onClick={onShowFollowers}
        className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card px-3 py-3.5 sm:px-4 sm:py-3 hover:bg-accent transition-colors touch-target min-h-[52px] sm:min-h-0"
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
        <div className="text-left min-w-0">
          <div className="text-base sm:text-2xl font-bold text-text-main tabular-nums">{stats.followersCount}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">{t('profile.profileStats.followers')}</div>
        </div>
      </button>
      
      <button
        type="button"
        onClick={onShowFollowing}
        className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card px-3 py-3.5 sm:px-4 sm:py-3 hover:bg-accent transition-colors touch-target min-h-[52px] sm:min-h-0"
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
        <div className="text-left min-w-0">
          <div className="text-base sm:text-2xl font-bold text-text-main tabular-nums">{stats.followingCount}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">{t('profile.profileStats.following')}</div>
        </div>
      </button>
    </div>
  );
}
