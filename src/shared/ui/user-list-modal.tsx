import { User as UserIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { userProfilePath } from "@/shared/lib/user-profile-path";
import type { SubscriptionUser } from "@/shared/api";
import { UserBadges } from "@/shared/ui/user-badges";

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

  const handleUserClick = (userId: number, username: string) => {
    onClose();
    if (currentUserId === userId) {
      router.push("/profile");
    } else {
      router.push(userProfilePath(username));
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  const avatarSrc = (avatar: string | null | undefined): string | null => {
    if (!avatar?.trim()) return null;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    return `${apiBase}${avatar}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md max-h-[80vh] overflow-y-auto rounded-lg border border-border p-3 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-text-main">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-text-muted hover:text-text-main"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-6 text-center text-sm text-text-muted">{t("common.loading")}</div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-sm text-text-muted">{emptyMessage}</div>
        ) : (
          <div className="space-y-1.5">
            {users.map((user) => {
              const src = avatarSrc(user.avatar);
              return (
              <div
                key={user.id}
                className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-accent transition-colors"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left"
                  onClick={() => handleUserClick(user.id, user.username)}
                >
                  <span className="relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL с API
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-text-muted">
                        <UserIcon className="size-4" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 items-center gap-1 truncate font-medium text-text-main">
                    {user.username}
                    <UserBadges
                      role={user.role}
                      createdPointsCount={user.createdPointsCount}
                      className="shrink-0"
                    />
                  </span>
                </button>

                {currentUserId !== user.id && (
                  <Button
                    size="sm"
                    variant={followingStates[user.id] ? "destructive" : "default"}
                    disabled={actionLoadingStates[user.id]}
                    className="shrink-0"
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
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
