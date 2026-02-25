"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, UserListModal, Loading, ErrorMessage } from "@/shared/ui";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation, useFollowManagement, useUserModal, useToast } from "@/shared/lib/hooks";
import { 
  useProfileQuery, 
  useUpdateProfileMutation, 
  usePointsQuery, 
  useSubscriptionStatsQuery,
  useLogoutMutation 
} from "@/shared/lib/hooks/queries";
import { ProfileHeader, ProfileStats, ProfileForm, ProfilePoints } from "@/features/profile";

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

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleSave = async (data: { username: string; bio: string }) => {
    await updateProfileMutation.mutateAsync(data);
    setIsEditing(false);
    toast.success(t("profile.updateSuccess"));
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push("/auth"),
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

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message={t("profile.loadError")} />;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          <ProfileHeader
            username={profile.username || t("profile.title")}
            email={profile.email}
            isEditing={isEditing}
            onEdit={handleEdit}
          />

          {stats && (
            <ProfileStats
              stats={stats}
              onShowFollowers={handleShowFollowers}
              onShowFollowing={handleShowFollowing}
            />
          )}

          <ProfileForm
            profile={profile}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          {!isEditing && (
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? t("profile.loggingOut") : t("profile.logout")}
            </Button>
          )}

          <ProfilePoints
            points={points}
            loading={pointsLoading}
            onRefetch={refetchPoints}
          />
        </div>
      </div>

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
