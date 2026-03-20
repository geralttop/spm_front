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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-main">{user?.username || "User"}</h1>
              <p className="mt-1 text-sm text-text-muted">{user?.email}</p>
            </div>
            
            <Button 
              onClick={handleFollowToggleMain}
              disabled={actionLoading}
              variant={isFollowing ? "destructive" : "default"}
              className={isFollowing 
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              }
            >
              {actionLoading ? "..." : isFollowing ? t("profile.unfollow") : t("profile.follow")}
            </Button>
          </div>

          {/* Subscription Stats */}
          {stats && (
            <div className="flex gap-4">
              <button
                onClick={handleShowFollowers}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 text-text-muted" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-text-main">{stats.followersCount}</div>
                  <div className="text-sm text-text-muted">{t("profile.followers")}</div>
                </div>
              </button>
              
              <button
                onClick={handleShowFollowing}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
              >
                <Users className="h-5 w-5 text-text-muted" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-text-main">{stats.followingCount}</div>
                  <div className="text-sm text-text-muted">{t("profile.following")}</div>
                </div>
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text-main">
              {t("profile.profileInfo")}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <User className="h-4 w-4" />
                  {t("profile.username")}
                </label>
                <p className="text-text-main font-medium">{user?.username || "-"}</p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4" />
                  {t("profile.email")}
                </label>
                <p className="text-text-main font-medium">{user?.email}</p>
              </div>

              {user?.bio && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-muted">
                    {t("profile.bio")}
                  </label>
                  <p className="text-text-main whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Points Section */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("profile.userPoints")} {user?.username}
            </h2>

            {pointsLoading ? (
              <div className="text-center py-8 text-text-muted">
                {t("profile.loadingPoints")}
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                {t("profile.noUserPoints")}
              </div>
            ) : (
              <div className="space-y-6">
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
