'use client';

import { Users } from 'lucide-react';
import type { SubscriptionStats } from '@/shared/types';

interface ProfileStatsProps {
  stats: SubscriptionStats;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
}

export function ProfileStats({ stats, onShowFollowers, onShowFollowing }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:flex sm:w-auto">
      <button
        onClick={onShowFollowers}
        className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4 hover:bg-accent transition-colors"
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
        <div className="text-left min-w-0">
          <div className="text-lg sm:text-2xl font-bold text-text-main">{stats.followersCount}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">Подписчики</div>
        </div>
      </button>
      
      <button
        onClick={onShowFollowing}
        className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4 hover:bg-accent transition-colors"
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
        <div className="text-left min-w-0">
          <div className="text-lg sm:text-2xl font-bold text-text-main">{stats.followingCount}</div>
          <div className="text-xs sm:text-sm text-text-muted truncate">Подписки</div>
        </div>
      </button>
    </div>
  );
}
