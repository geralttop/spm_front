"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, UserListModal, Loading } from "@/shared/ui";
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useFollowManagement, useUserModal } from "@/shared/lib/hooks";
import { 
  useProfileQuery, 
  usePointsQuery, 
  useSubscriptionStatsQuery,
  useFollowMutation,
  useUnfollowMutation 
} from "@/shared/lib/hooks/queries";
import { User, Mail, Users, MapPin } from "lucide-react";
import { PointCard } from "@/src/shared/ui/point-card";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const { data: currentProfile } = useProfileQuery();
  const currentUserId = currentProfile ? Number(currentProfile.userId) : null;
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { data: stats, refetch: refetchStats } = useSubscriptionStatsQuery(userId);
  const { data: points = [], isLoading: pointsLoading, refetch: refetchPoints } = usePointsQuery(userId);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();
  
  const followersModal = useUserModal();
  const followingModal = useUserModal();
  const { followingStates, actionLoadingStates, initializeFollowingStates, handleFollowToggle } = useFollowManagement();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push("/auth");
          return;
        }

        if (currentUserId === userId) {
          router.push("/profile");
          return;
        }
        
        const userData = await authApi.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        const isStillAuth = await checkAuth();
        if (!isStillAuth) {
          router.push("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId && currentUserId !== null) {
      fetchUserData();
    }
  }, [userId, currentUserId, router, checkAuth]);

  const handleFollowToggleMain = () => {
    const isFollowing = stats?.isFollowing || false;
    const mutation = isFollowing ? unfollowMutation : followMutation;
    
    mutation.mutate(userId, {
      onSuccess: () => {
        refetchStats();
      },
    });
  };

  const handleShowFollowers = async () => {
    const users = await followersModal.openModal(userId, "followers");
    await initializeFollowingStates(users);
  };

  const handleShowFollowing = async () => {
    const users = await followingModal.openModal(userId, "following");
    await initializeFollowingStates(users);
  };

  const handleFollowToggleInModal = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
    await handleFollowToggle(targetUserId, isCurrentlyFollowing);
  };

  if (loading) {
    return <Loading />;
  }

  if (!user && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">{t("profile.userNotFound")}</div>
      </div>
    );
  }

  const isFollowing = stats?.isFollowing || false;
  const actionLoading = followMutation.isPending || unfollowMutation.isPending;

  const avatarUrl =
    user?.avatar &&
    (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")
      ? user.avatar
      : `${process.env.NEXT_PUBLIC_API_URL ?? ""}${user.avatar}`);

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-4xl px-0 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Статистика подписок — как на личном профиле */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 px-4 sm:gap-4 sm:flex sm:w-auto sm:px-0">
              <button
                type="button"
                onClick={handleShowFollowers}
                className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3 py-3.5 transition-colors hover:bg-accent touch-target sm:min-h-0 sm:gap-3 sm:px-4 sm:py-3"
              >
                <Users className="h-4 w-4 shrink-0 text-text-muted sm:h-5 sm:w-5" />
                <div className="min-w-0 text-left">
                  <div className="text-base font-bold tabular-nums text-text-main sm:text-2xl">{stats.followersCount}</div>
                  <div className="truncate text-xs text-text-muted sm:text-sm">{t("profile.followers")}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleShowFollowing}
                className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3 py-3.5 transition-colors hover:bg-accent touch-target sm:min-h-0 sm:gap-3 sm:px-4 sm:py-3"
              >
                <Users className="h-4 w-4 shrink-0 text-text-muted sm:h-5 sm:w-5" />
                <div className="min-w-0 text-left">
                  <div className="text-base font-bold tabular-nums text-text-main sm:text-2xl">{stats.followingCount}</div>
                  <div className="truncate text-xs text-text-muted sm:text-sm">{t("profile.following")}</div>
                </div>
              </button>
            </div>
          )}

          {/* Карточка профиля: шапка как в ProfileForm, вместо «Редактировать» — подписка */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:mb-6 sm:flex-row sm:items-center sm:gap-4 sm:pb-6">
              <div className="shrink-0">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted sm:h-24 sm:w-24 sm:border-4">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL с API
                    <img
                      src={avatarUrl}
                      alt={user?.username ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <User className="h-8 w-8 text-primary/50 sm:h-12 sm:w-12" aria-hidden />
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 w-full flex-1 sm:w-auto">
                <h1 className="truncate text-xl font-bold text-text-main sm:text-3xl">
                  {user?.username || "User"}
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-muted break-all sm:mt-1 sm:text-sm">{user?.email}</p>
              </div>

              <Button
                onClick={handleFollowToggleMain}
                disabled={actionLoading}
                variant={isFollowing ? "destructive" : "outline"}
                className="w-full shrink-0 touch-target gap-2 sm:w-auto"
              >
                {actionLoading ? "..." : isFollowing ? t("profile.unfollow") : t("profile.follow")}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <User className="h-4 w-4 shrink-0" />
                  {t("profile.username")}
                </label>
                <p className="hyphens-auto font-medium text-text-main">{user?.username || "-"}</p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4 shrink-0" />
                  {t("profile.email")}
                </label>
                <p className="break-all font-medium text-text-main">{user?.email}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-muted">{t("profile.bio")}</label>
                <p className="hyphens-auto whitespace-pre-wrap text-text-main">{user?.bio || "-"}</p>
              </div>
            </div>
          </div>

          {/* User Points Section */}
          <div>
            <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-text-main flex items-center gap-2 px-4 sm:px-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="truncate">{t("profile.userPoints")} {user?.username}</span>
            </h2>

            {pointsLoading ? (
              <div className="text-center py-8 text-text-muted px-4 sm:px-0">
                {t("profile.loadingPoints")}
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-8 text-text-muted px-4 sm:px-0">
                {t("profile.noUserPoints")}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
                {points.map((point) => (
                  <PointCard 
                    key={point.id} 
                    point={point} 
                    onFavoriteChange={() => refetchPoints()}
                    onPointUpdate={() => refetchPoints()}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <UserListModal
        isOpen={followersModal.showModal}
        onClose={followersModal.closeModal}
        title={t("profile.followers")}
        users={followersModal.users}
        loading={followersModal.loading}
        emptyMessage={t("profile.noFollowers")}
        currentUserId={currentUserId || undefined}
        followingStates={followingStates}
        actionLoadingStates={actionLoadingStates}
        onFollowToggle={handleFollowToggleInModal}
        followLabel={t("profile.follow")}
        unfollowLabel={t("profile.unfollow")}
      />

      {/* Following Modal */}
      <UserListModal
        isOpen={followingModal.showModal}
        onClose={followingModal.closeModal}
        title={t("profile.following")}
        users={followingModal.users}
        loading={followingModal.loading}
        emptyMessage={t("profile.noFollowing")}
        currentUserId={currentUserId || undefined}
        followingStates={followingStates}
        actionLoadingStates={actionLoadingStates}
        onFollowToggle={handleFollowToggleInModal}
        followLabel={t("profile.follow")}
        unfollowLabel={t("profile.unfollow")}
      />
    </div>
  );
}
