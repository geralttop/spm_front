"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, UserListModal } from "@/shared/ui";
import { authApi, pointsApi, subscriptionsApi, type ProfileResponse, type Point, type SubscriptionStats } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useFollowManagement, useUserModal } from "@/shared/lib/hooks";
import { User, Mail, Edit2, X, Check, MapPin, Users } from "lucide-react";
import { PointCard } from "@/src/shared/ui/point-card";

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
  
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });

  // Используем новые хуки
  const followersModal = useUserModal();
  const followingModal = useUserModal();
  const { followingStates, actionLoadingStates, initializeFollowingStates, initializeFollowingList, handleFollowToggle } = useFollowManagement();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push("/auth");
          return;
        }

        const data = await authApi.getProfile();
        setProfile(data);
        setEditForm({
          username: data.username || "",
          bio: data.bio || "",
        });
        
        const statsData = await subscriptionsApi.getStats(Number(data.userId));
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        const isStillAuth = await checkAuth();
        if (!isStillAuth) {
          clearAuth();
          router.push("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, clearAuth, checkAuth]);

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

  useEffect(() => {
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
    await followersModal.openModal(Number(profile.userId), "followers");
    await initializeFollowingStates(followersModal.users);
  };

  const handleShowFollowing = async () => {
    if (!profile) return;
    await followingModal.openModal(Number(profile.userId), "following");
    initializeFollowingList(followingModal.users);
  };

  const handleFollowToggleInModal = async (userId: number, isCurrentlyFollowing: boolean) => {
    await handleFollowToggle(userId, isCurrentlyFollowing, (isFollowing) => {
      if (stats) {
        setStats({
          ...stats,
          followingCount: isFollowing ? stats.followingCount + 1 : stats.followingCount - 1,
        });
      }
      
      // Удаляем из списка подписок если отписались
      if (!isFollowing && followingModal.showModal) {
        followingModal.closeModal();
        handleShowFollowing();
      }
    });
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
        currentUserId={profile ? Number(profile.userId) : undefined}
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
        currentUserId={profile ? Number(profile.userId) : undefined}
        followingStates={followingStates}
        actionLoadingStates={actionLoadingStates}
        onFollowToggle={handleFollowToggleInModal}
        followLabel={t("profile.follow")}
        unfollowLabel={t("profile.unfollow")}
      />
    </div>
  );
}
