import { User as UserIcon, Flag } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { ReportModal } from "./report-modal";
import { useAuthStore } from "@/shared/lib/store";
import { useProfileQuery } from "@/shared/lib/hooks";
import type { SearchUserResult } from "@/shared/api";

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
    console.log('Жалоба на пользователя успешно отправлена');
  };
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
    >
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-main truncate">
          {user.username}
        </h3>
        <p className="text-sm text-text-muted truncate">
          {user.email}
        </p>
        {user.bio && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>
      
      {(actionButton || canReport) && (
        <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actionButton}
          {canReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportModal(true)}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              title={t('reports.button')}
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
