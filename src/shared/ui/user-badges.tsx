"use client";

import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/hooks";
import {
  ADMIN_BADGE_FILENAME,
  badgePublicUrl,
  milestoneBadgeFilename,
} from "@/shared/lib/user-badges";

export interface UserBadgesProps {
  role?: string;
  createdPointsCount?: number;
  className?: string;
}

function milestoneI18nKey(filename: string): string {
  if (filename === "5points_status.png") return "badges.milestone5";
  if (filename === "10points_status.png") return "badges.milestone10";
  if (filename === "15points_status.png") return "badges.milestone15";
  if (filename === "20points_status.png") return "badges.milestone20";
  return "badges.milestone5";
}

export function UserBadges({
  role,
  createdPointsCount,
  className,
}: UserBadgesProps) {
  const { t } = useTranslation();
  const isAdmin = role === "admin";
  const milestoneFile = milestoneBadgeFilename(createdPointsCount);

  const parts: string[] = [];
  if (isAdmin) parts.push(t("badges.admin"));
  if (milestoneFile) parts.push(t(milestoneI18nKey(milestoneFile)));

  if (!isAdmin && !milestoneFile) {
    return null;
  }

  const ariaLabel = parts.length ? parts.join(", ") : undefined;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {isAdmin ? (
        <img
          src={badgePublicUrl(ADMIN_BADGE_FILENAME)}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0 object-contain dark:opacity-95"
          title={t("badges.admin")}
        />
      ) : null}
      {milestoneFile ? (
        <img
          src={badgePublicUrl(milestoneFile)}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0 object-contain dark:opacity-95"
          title={t(milestoneI18nKey(milestoneFile))}
        />
      ) : null}
    </span>
  );
}
