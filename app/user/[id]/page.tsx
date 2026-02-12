"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/shared/ui";
import { subscriptionsApi, authApi, type SubscriptionUser, type SubscriptionStats } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { User, Mail, Users, X } from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [user, setUser] = useState<SubscriptionUser | null>(null);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<SubscriptionUser[]>([]);
  const [followingList, setFollowingList] = useState<SubscriptionUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  // Состояния для управления подписками в модальных окнах
  const [followingStates, setFollowingStates] = useState<Record<number, boolean>>({});
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Проверяем аутентификацию перед API вызовами
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push("/auth");
          return;
        }

        // Получаем текущий профиль для проверки
        const currentProfile = await authApi.getProfile();
        const currentId = Number(currentProfile.userId);
        setCurrentUserId(currentId);
        
        // Если это наш собственный профиль, перенаправляем на /profile
        if (currentId === userId) {
          router.push("/profile");
          return;
        }
        
        // Получаем данные пользователя
        const userData = await authApi.getUserById(userId);
        setUser(userData);
        
        // Получаем статистику (включает isFollowing)
        const statsData = await subscriptionsApi.getStats(userId);
        setStats(statsData);
        setFollowing(statsData.isFollowing || false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Проверяем, не связана ли ошибка с аутентификацией
        const isStillAuth = await checkAuth();
        if (!isStillAuth) {
          router.push("/auth");
        } else {
          // Если аутентификация в порядке, но данные не загрузились
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

  const handleFollowToggle = async () => {
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
    setLoadingFollowers(true);
    setShowFollowersModal(true);
    try {
      const data = await subscriptionsApi.getFollowers(userId);
      setFollowers(data);
      
      // Для подписчиков нужно проверить, подписаны ли мы на каждого из них
      const followingStatesPromises = data.map(async (user) => {
        try {
          const userStats = await subscriptionsApi.getStats(user.id);
          return { userId: user.id, isFollowing: userStats.isFollowing || false };
        } catch (error) {
          console.error(`Error getting stats for user ${user.id}:`, error);
          return { userId: user.id, isFollowing: false };
        }
      });
      
      const followingStatesResults = await Promise.all(followingStatesPromises);
      const initialStates: Record<number, boolean> = {};
      followingStatesResults.forEach(({ userId, isFollowing }) => {
        initialStates[userId] = isFollowing;
      });
      setFollowingStates(initialStates);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleShowFollowing = async () => {
    setLoadingFollowing(true);
    setShowFollowingModal(true);
    try {
      const data = await subscriptionsApi.getFollowing(userId);
      setFollowingList(data);
      
      // Для подписок нужно проверить, подписаны ли мы на каждого из них
      const followingStatesPromises = data.map(async (user) => {
        try {
          const userStats = await subscriptionsApi.getStats(user.id);
          return { userId: user.id, isFollowing: userStats.isFollowing || false };
        } catch (error) {
          console.error(`Error getting stats for user ${user.id}:`, error);
          return { userId: user.id, isFollowing: false };
        }
      });
      
      const followingStatesResults = await Promise.all(followingStatesPromises);
      const initialStates: Record<number, boolean> = {};
      followingStatesResults.forEach(({ userId, isFollowing }) => {
        initialStates[userId] = isFollowing;
      });
      setFollowingStates(initialStates);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollowToggleInModal = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
    setActionLoadingStates(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      if (isCurrentlyFollowing) {
        await subscriptionsApi.unfollow(targetUserId);
        setFollowingStates(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await subscriptionsApi.follow(targetUserId);
        setFollowingStates(prev => ({ ...prev, [targetUserId]: true }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
    }
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
              onClick={handleFollowToggle}
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
              {/* Username */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <User className="h-4 w-4" />
                  {t("profile.username")}
                </label>
                <p className="text-text-main font-medium">{user?.username || "-"}</p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4" />
                  {t("profile.email")}
                </label>
                <p className="text-text-main font-medium">{user?.email}</p>
              </div>

              {/* Bio */}
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
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-main">{t("profile.followers")}</h2>
              <button onClick={() => setShowFollowersModal(false)} className="text-text-muted hover:text-text-main">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {loadingFollowers ? (
              <div className="text-center py-8 text-text-muted">{t("profile.loading")}</div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-text-muted">{t("profile.noFollowers")}</div>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div 
                    key={follower.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setShowFollowersModal(false);
                        // Проверяем, не наш ли это профиль
                        if (currentUserId === follower.id) {
                          router.push("/profile");
                        } else {
                          router.push(`/user/${follower.id}`);
                        }
                      }}
                    >
                      <p className="font-medium text-text-main">{follower.username}</p>
                      <p className="text-sm text-text-muted">{follower.email}</p>
                      {follower.bio && <p className="text-xs text-text-muted mt-1">{follower.bio}</p>}
                    </div>
                    
                    {/* Кнопка подписки/отписки */}
                    {currentUserId !== follower.id && (
                      <Button
                        size="sm"
                        variant={followingStates[follower.id] ? "destructive" : "default"}
                        disabled={actionLoadingStates[follower.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggleInModal(follower.id, followingStates[follower.id] || false);
                        }}
                        className={followingStates[follower.id] 
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                          : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        }
                      >
                        {actionLoadingStates[follower.id] 
                          ? "..." 
                          : followingStates[follower.id] 
                            ? t("profile.unfollow") 
                            : t("profile.follow")
                        }
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-main">{t("profile.following")}</h2>
              <button onClick={() => setShowFollowingModal(false)} className="text-text-muted hover:text-text-main">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {loadingFollowing ? (
              <div className="text-center py-8 text-text-muted">{t("profile.loading")}</div>
            ) : followingList.length === 0 ? (
              <div className="text-center py-8 text-text-muted">{t("profile.noFollowing")}</div>
            ) : (
              <div className="space-y-3">
                {followingList.map((followingUser) => (
                  <div 
                    key={followingUser.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setShowFollowingModal(false);
                        // Проверяем, не наш ли это профиль
                        if (currentUserId === followingUser.id) {
                          router.push("/profile");
                        } else {
                          router.push(`/user/${followingUser.id}`);
                        }
                      }}
                    >
                      <p className="font-medium text-text-main">{followingUser.username}</p>
                      <p className="text-sm text-text-muted">{followingUser.email}</p>
                      {followingUser.bio && <p className="text-xs text-text-muted mt-1">{followingUser.bio}</p>}
                    </div>
                    
                    {/* Кнопка подписки/отписки */}
                    {currentUserId !== followingUser.id && (
                      <Button
                        size="sm"
                        variant={followingStates[followingUser.id] ? "destructive" : "default"}
                        disabled={actionLoadingStates[followingUser.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggleInModal(followingUser.id, followingStates[followingUser.id] || false);
                        }}
                        className={followingStates[followingUser.id] 
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                          : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        }
                      >
                        {actionLoadingStates[followingUser.id] 
                          ? "..." 
                          : followingStates[followingUser.id] 
                            ? t("profile.unfollow") 
                            : t("profile.follow")
                        }
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
