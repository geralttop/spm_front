"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, UserListModal, Loading, ErrorMessage } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useFollowManagement, useUserModal, useToast } from "@/shared/lib/hooks";
import { 
  useProfileQuery, 
  useUpdateProfileMutation, 
  usePointsQuery, 
  useSubscriptionStatsQuery,
  useLogoutMutation 
} from "@/shared/lib/hooks/queries";
import { User, Mail, Edit2, X, Check, MapPin, Users } from "lucide-react";
import { PointCard } from "@/src/shared/ui/point-card";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const { data: profile, isLoading, error } = useProfileQuery();
  const { data: points = [], isLoading: pointsLoading, refetch: refetchPoints } = usePointsQuery();
  const { data: stats } = useSubscriptionStatsQuery(profile ? Number(profile.userId) : 0);
  const updateProfileMutation = useUpdateProfileMutation();
  const logoutMutation = useLogoutMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
  });

  const followersModal = useUserModal();
  const followingModal = useUserModal();
  const { followingStates, actionLoadingStates, initializeFollowingStates, initializeFollowingList, handleFollowToggle } = useFollowManagement();

  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push("/auth");
      }
    };

    initAuth();
  }, [router, checkAuth]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/auth");
      },
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: profile?.username || "",
      bio: profile?.bio || "",
    });
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editForm, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success(t("profile.updateSuccess"));
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || t("profile.updateError"));
      },
    });
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
      if (!isFollowing && followingModal.showModal) {
        followingModal.closeModal();
        handleShowFollowing();
      }
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={t("profile.loadError")} />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-main truncate">
                {profile.username || t("profile.title")}
              </h1>
              <p className="mt-1 text-sm text-text-muted truncate">{profile.email}</p>
            </div>
            
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" className="gap-2 w-full sm:w-auto">
                <Edit2 className="h-4 w-4" />
                <span className="sm:inline">{t("profile.edit")}</span>
              </Button>
            )}
          </div>

          {/* Subscription Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:flex sm:w-auto">
              <button
                onClick={handleShowFollowers}
                className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4 hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
                <div className="text-left min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-text-main">{stats.followersCount}</div>
                  <div className="text-xs sm:text-sm text-text-muted truncate">{t("profile.followers")}</div>
                </div>
              </button>
              
              <button
                onClick={handleShowFollowing}
                className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:px-4 hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted shrink-0" />
                <div className="text-left min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-text-main">{stats.followingCount}</div>
                  <div className="text-xs sm:text-sm text-text-muted truncate">{t("profile.following")}</div>
                </div>
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-text-main">
              {t("profile.profileInfo")}
            </h2>
            
            <div className="space-y-4">
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
                  <p className="text-text-main font-medium hyphens-auto">
                    {profile.username || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4" />
                  {t("profile.email")}
                </label>
                <p className="text-text-main font-medium break-all">{profile.email}</p>
              </div>

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
                  <p className="text-text-main whitespace-pre-wrap hyphens-auto">
                    {profile.bio || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 gap-2 w-full"
                >
                  <Check className="h-4 w-4" />
                  {updateProfileMutation.isPending ? t("profile.saving") : t("profile.save")}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 gap-2 w-full"
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
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? t("profile.loggingOut") : t("profile.logout")}
              </Button>
            )}
          </div>

          {/* My Points Section */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-text-main flex items-center gap-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="space-y-4 sm:space-y-6">
                {points.map((point) => (
                  <PointCard 
                    key={point.id} 
                    point={point} 
                    showAuthor={false}
                    onFavoriteChange={() => refetchPoints()}
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
