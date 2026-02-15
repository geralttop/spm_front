"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, UserListModal } from "@/shared/ui";
import { subscriptionsApi, authApi, pointsApi, type SubscriptionUser, type SubscriptionStats, type Point } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useFollowManagement, useUserModal } from "@/shared/lib/hooks";
import { User, Mail, Users, MapPin } from "lucide-react";
import { PointCard } from "@/src/shared/ui/point-card";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [user, setUser] = useState<SubscriptionUser | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Используем новые хуки
  const followersModal = useUserModal();
  const followingModal = useUserModal();
  const { followingStates, actionLoadingStates, initializeFollowingStates, handleFollowToggle } = useFollowManagement();

  const fetchPoints = async () => {
    try {
      setPointsLoading(true);
      const userPoints = await pointsApi.getAll(userId);
      setPoints(userPoints);
    } catch (pointsError) {
      console.error("Error fetching user points:", pointsError);
      setPoints([]);
    } finally {
      setPointsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push("/auth");
          return;
        }

        const currentProfile = await authApi.getProfile();
        const currentId = Number(currentProfile.userId);
        setCurrentUserId(currentId);
        
        if (currentId === userId) {
          router.push("/profile");
          return;
        }
        
        const userData = await authApi.getUserById(userId);
        setUser(userData);
        
        const statsData = await subscriptionsApi.getStats(userId);
        setStats(statsData);
        setFollowing(statsData.isFollowing || false);
        
        await fetchPoints();
      } catch (error) {
        console.error("Error fetching user data:", error);
        const isStillAuth = await checkAuth();
        if (!isStillAuth) {
          router.push("/auth");
        } else {
          setUser(null);
          setStats(null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, router, checkAuth]);

  const handleFollowToggleMain = async () => {
    setActionLoading(true);
    try {
      if (following) {
        await subscriptionsApi.unfollow(userId);
        setFollowing(false);
        if (stats) {
          setStats({ ...stats, followersCount: stats.followersCount - 1 });
        }
      } else {
        await subscriptionsApi.follow(userId);
        setFollowing(true);
        if (stats) {
          setStats({ ...stats, followersCount: stats.followersCount + 1 });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowFollowers = async () => {
    await followersModal.openModal(userId, "followers");
    await initializeFollowingStates(followersModal.users);
  };

  const handleShowFollowing = async () => {
    await followingModal.openModal(userId, "following");
    await initializeFollowingStates(followingModal.users);
  };

  const handleFollowToggleInModal = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
    await handleFollowToggle(targetUserId, isCurrentlyFollowing);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">{t("profile.loading")}</div>
      </div>
    );
  }

  if (!user && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">Пользователь не найден</div>
      </div>
    );
  }

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
              variant={following ? "destructive" : "default"}
              className={following 
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              }
            >
              {actionLoading ? "..." : following ? t("profile.unfollow") : t("profile.follow")}
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
              Точки пользователя {user?.username}
            </h2>

            {pointsLoading ? (
              <div className="text-center py-8 text-text-muted">
                Загрузка точек...
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                У пользователя пока нет точек
              </div>
            ) : (
              <div className="space-y-6">
                {points.map((point) => (
                  <PointCard 
                    key={point.id} 
                    point={point} 
                    showAuthor={false}
                    onFavoriteChange={() => fetchPoints()}
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
