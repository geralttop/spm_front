import { User as UserIcon, Flag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { ReportModal } from "./report-modal";
import { useAuthStore } from "@/shared/lib/store";
import { useProfileQuery } from "@/shared/lib/hooks";
import type { SearchUserResult } from "@/shared/api";
import { UserBadges } from "@/shared/ui/user-badges";

interface UserCardProps {
  user: SearchUserResult;
  onClick: () => void;
  actionButton?: React.ReactNode;
  showReportButton?: boolean;
}

export function UserCard({ user, onClick, actionButton, showReportButton = true }: UserCardProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: profile } = useProfileQuery();
  const [showReportModal, setShowReportModal] = useState(false);

  const currentUserId = profile ? Number(profile.userId) : null;
  const canReport = showReportButton && accessToken && currentUserId && currentUserId !== user.id;

  const handleReportSuccess = () => {
  };
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:gap-4 sm:p-4"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-text-main">
            <span className="truncate">{user.username}</span>
            <UserBadges
              role={user.role}
              createdPointsCount={user.createdPointsCount}
              className="shrink-0"
            />
          </h3>
          <p className="truncate text-sm text-text-muted">{user.email}</p>
          {user.bio && (
            <p className="mt-1 line-clamp-2 text-xs text-text-muted">{user.bio}</p>
          )}
        </div>
      </div>

      {(actionButton || canReport) && (
        <div
          className="flex shrink-0 items-center justify-end gap-2 border-t border-border pt-3 sm:w-auto sm:border-t-0 sm:pt-0"
          onClick={(e) => e.stopPropagation()}
        >
          {actionButton}
          {canReport && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setShowReportModal(true)}
              className="min-h-[44px] min-w-[44px] text-text-muted hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
              title={t("reports.button")}
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="user"
        targetId={user.id}
        targetName={user.username}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}
