import { X, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import type { SubscriptionUser } from "@/shared/api";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: SubscriptionUser[];
  loading: boolean;
  emptyMessage: string;
  currentUserId?: number;
  followingStates: Record<number, boolean>;
  actionLoadingStates: Record<number, boolean>;
  onFollowToggle: (userId: number, isFollowing: boolean) => void;
  followLabel: string;
  unfollowLabel: string;
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  loading,
  emptyMessage,
  currentUserId,
  followingStates,
  actionLoadingStates,
  onFollowToggle,
  followLabel,
  unfollowLabel,
}: UserListModalProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!isOpen) return null;

  const handleUserClick = (userId: number) => {
    onClose();
    if (currentUserId === userId) {
      router.push("/profile");
    } else {
      router.push(`/user/${userId}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg border border-border p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-main">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-text-muted">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-text-muted">{emptyMessage}</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <p className="font-medium text-text-main">{user.username}</p>
                  <p className="text-sm text-text-muted">{user.email}</p>
                  {user.bio && (
                    <p className="text-xs text-text-muted mt-1">{user.bio}</p>
                  )}
                </div>

                {currentUserId !== user.id && (
                  <Button
                    size="sm"
                    variant={followingStates[user.id] ? "destructive" : "default"}
                    disabled={actionLoadingStates[user.id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowToggle(user.id, followingStates[user.id] || false);
                    }}
                  >
                    {actionLoadingStates[user.id]
                      ? "..."
                      : followingStates[user.id]
                      ? unfollowLabel
                      : followLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
