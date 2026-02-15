import { Users } from "lucide-react";
import type { SubscriptionStats } from "@/shared/api";

interface SubscriptionStatsProps {
  stats: SubscriptionStats;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  followersLabel: string;
  followingLabel: string;
}

export function SubscriptionStatsComponent({
  stats,
  onFollowersClick,
  onFollowingClick,
  followersLabel,
  followingLabel,
}: SubscriptionStatsProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onFollowersClick}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
      >
        <Users className="h-5 w-5 text-text-muted" />
        <div className="text-left">
          <div className="text-2xl font-bold text-text-main">{stats.followersCount}</div>
          <div className="text-sm text-text-muted">{followersLabel}</div>
        </div>
      </button>
      
      <button
        onClick={onFollowingClick}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
      >
        <Users className="h-5 w-5 text-text-muted" />
        <div className="text-left">
          <div className="text-2xl font-bold text-text-main">{stats.followingCount}</div>
          <div className="text-sm text-text-muted">{followingLabel}</div>
        </div>
      </button>
    </div>
  );
}
