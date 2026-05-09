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
  isVerified?: boolean;
  className?: string;
}

function VerifiedBadgeIcon(props: { title?: string }) {
  const { title } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      className="h-[18px] w-[18px] shrink-0 text-primary"
      role={title ? "img" : undefined}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m8 12.5 2.6 2.6L16.5 9.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  isVerified,
  className,
}: UserBadgesProps) {
  const { t } = useTranslation();
  const isAdmin = role === "admin";
  const milestoneFile = milestoneBadgeFilename(createdPointsCount);

  const parts: string[] = [];
  if (isVerified) parts.push(t("badges.verified"));
  if (isAdmin) parts.push(t("badges.admin"));
  if (milestoneFile) parts.push(t(milestoneI18nKey(milestoneFile)));

  if (!isVerified && !isAdmin && !milestoneFile) {
    return null;
  }

  const ariaLabel = parts.length ? parts.join(", ") : undefined;

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {isVerified ? <VerifiedBadgeIcon title={t("badges.verified")} /> : null}
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
