"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/shared/ui";
import { authApi, pointsApi, subscriptionsApi, type ProfileResponse, type Point, type SubscriptionUser, type SubscriptionStats } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { User, Mail, Edit2, X, Check, MapPin, Tag, Package, Calendar, Users } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<SubscriptionUser[]>([]);
  const [following, setFollowing] = useState<SubscriptionUser[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  
  // Состояния для управления подписками в модальных окнах
  const [followingStates, setFollowingStates] = useState<Record<number, boolean>>({});
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<number, boolean>>({});
  
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setProfile(data);
        setEditForm({
          username: data.username || "",
          bio: data.bio || "",
        });
        
        // Загружаем статистику подписок
        const statsData = await subscriptionsApi.getStats(Number(data.userId));
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Только если запрос не удался, очищаем auth и редиректим
        clearAuth();
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, clearAuth]);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const data = await pointsApi.getAll();
        setPoints(data);
      } catch (error) {
        console.error("Error fetching points:", error);
      } finally {
        setPointsLoading(false);
      }
    };

    if (!loading) {
      fetchPoints();
    }
  }, [loading]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearAuth();
      router.push("/auth");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: profile?.username || "",
      bio: profile?.bio || "",
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedProfile = await authApi.updateProfile(editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess(t("profile.updateSuccess"));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || t("profile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const handleShowFollowers = async () => {
    if (!profile) return;
    setLoadingFollowers(true);
    setShowFollowersModal(true);
    try {
      const data = await subscriptionsApi.getFollowers(Number(profile.userId));
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
    if (!profile) return;
    setLoadingFollowing(true);
    setShowFollowingModal(true);
    try {
      const data = await subscriptionsApi.getFollowing(Number(profile.userId));
      setFollowing(data);
      
      // Инициализируем состояния подписок - все пользователи в списке "подписки" уже подписаны
      const initialStates: Record<number, boolean> = {};
      data.forEach(user => {
        initialStates[user.id] = true; // Мы на них подписаны
      });
      setFollowingStates(initialStates);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollowToggleInModal = async (userId: number, isCurrentlyFollowing: boolean) => {
    setActionLoadingStates(prev => ({ ...prev, [userId]: true }));
    
    try {
      if (isCurrentlyFollowing) {
        await subscriptionsApi.unfollow(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        
        // Обновляем статистику
        if (stats) {
          setStats({ ...stats, followingCount: stats.followingCount - 1 });
        }
        
        // Удаляем пользователя из списка подписок, если мы в модальном окне подписок
        if (showFollowingModal) {
          setFollowing(prev => prev.filter(user => user.id !== userId));
        }
      } else {
        await subscriptionsApi.follow(userId);
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        
        // Обновляем статистику
        if (stats) {
          setStats({ ...stats, followingCount: stats.followingCount + 1 });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setActionLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">{t("profile.loading")}</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-main">{profile.username || t("profile.title")}</h1>
              <p className="mt-1 text-sm text-text-muted">{profile.email}</p>
            </div>
            
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" className="gap-2">
                <Edit2 className="h-4 w-4" />
                {t("profile.edit")}
              </Button>
            )}
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

          {/* Success/Error Messages */}
          {success && (
            <div className="rounded-lg bg-secondary/10 p-4 text-sm text-secondary border border-secondary/20">
              {success}
            </div>
          )}
          
          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
              {error}
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
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder={t("profile.usernamePlaceholder")}
                    maxLength={30}
                    minLength={3}
                  />
                ) : (
                  <p className="text-text-main font-medium">
                    {profile.username || "-"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4" />
                  {t("profile.email")}
                </label>
                <p className="text-text-main font-medium">{profile.email}</p>
              </div>

              {/* Bio */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text-muted">
                  {t("profile.bio")}
                </label>
                {isEditing ? (
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder={t("profile.bioPlaceholder")}
                    maxLength={1000}
                    rows={4}
                  />
                ) : (
                  <p className="text-text-main whitespace-pre-wrap">
                    {profile.bio || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 gap-2"
                >
                  <Check className="h-4 w-4" />
                  {saving ? t("profile.saving") : t("profile.save")}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={saving}
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  {t("profile.cancel")}
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleLogout} 
                variant="destructive" 
                className="w-full"
                disabled={loggingOut}
              >
                {loggingOut ? t("profile.loggingOut") : t("profile.logout")}
              </Button>
            )}
          </div>

          {/* My Points Section */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("profile.myPoints")}
            </h2>

            {pointsLoading ? (
              <div className="text-center py-8 text-text-muted">
                {t("profile.pointsLoading")}
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                {t("profile.noPoints")}
              </div>
            ) : (
              <div className="space-y-4">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-lg border border-border bg-muted p-4 hover:bg-accent transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-text-main mb-2">
                      {point.name}
                    </h3>
                    
                    {point.description && (
                      <p className="text-sm text-text-muted mb-3">
                        {point.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-text-muted" />
                        <span className="text-text-muted">{t("profile.category")}:</span>
                        <span className="text-text-main font-medium">
                          {point.category?.name || t("profile.noCategory")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-text-muted" />
                        <span className="text-text-muted">{t("profile.container")}:</span>
                        <span className="text-text-main font-medium">
                          {point.container?.name || t("profile.noContainer")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-text-muted" />
                        <span className="text-text-muted">{t("profile.coordinates")}:</span>
                        <span className="text-text-main font-mono text-xs">
                          {formatCoordinates(point.coords.coordinates)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-muted" />
                        <span className="text-text-muted">{t("profile.createdAt")}:</span>
                        <span className="text-text-main">
                          {formatDate(point.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {followers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setShowFollowersModal(false);
                        // Если это наш профиль, остаемся на /profile
                        if (profile && Number(profile.userId) === user.id) {
                          return;
                        }
                        router.push(`/user/${user.id}`);
                      }}
                    >
                      <p className="font-medium text-text-main">{user.username}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                      {user.bio && <p className="text-xs text-text-muted mt-1">{user.bio}</p>}
                    </div>
                    
                    {/* Кнопка подписки/отписки */}
                    {profile && Number(profile.userId) !== user.id && (
                      <Button
                        size="sm"
                        variant={followingStates[user.id] ? "destructive" : "default"}
                        disabled={actionLoadingStates[user.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggleInModal(user.id, followingStates[user.id] || false);
                        }}
                        className={followingStates[user.id] 
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                          : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        }
                      >
                        {actionLoadingStates[user.id] 
                          ? "..." 
                          : followingStates[user.id] 
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
            ) : following.length === 0 ? (
              <div className="text-center py-8 text-text-muted">{t("profile.noFollowing")}</div>
            ) : (
              <div className="space-y-3">
                {following.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setShowFollowingModal(false);
                        // Если это наш профиль, остаемся на /profile
                        if (profile && Number(profile.userId) === user.id) {
                          return;
                        }
                        router.push(`/user/${user.id}`);
                      }}
                    >
                      <p className="font-medium text-text-main">{user.username}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                      {user.bio && <p className="text-xs text-text-muted mt-1">{user.bio}</p>}
                    </div>
                    
                    {/* Кнопка отписки */}
                    {profile && Number(profile.userId) !== user.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoadingStates[user.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggleInModal(user.id, true); // В списке подписок всегда true
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                      >
                        {actionLoadingStates[user.id] 
                          ? "..." 
                          : t("profile.unfollow")
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
