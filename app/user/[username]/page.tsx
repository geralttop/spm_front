"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, UserListModal, Loading, ShareLinkButton } from "@/shared/ui";
import { authApi } from "@/shared/api";
import type { SearchUserResult } from "@/shared/types";
import { useAuthStore } from "@/shared/lib/store";
import { userProfilePath } from "@/shared/lib/user-profile-path";
import { useTranslation, useFollowManagement, useUserModal } from "@/shared/lib/hooks";
import { useProfileQuery, usePointsQuery, useSubscriptionStatsQuery, useFollowMutation, useUnfollowMutation, useBioHistoryQuery, } from "@/shared/lib/hooks/queries";
import { User, Mail, Users, MapPin, MessagesSquare } from "lucide-react";
import { PointCard } from "@/src/shared/ui/point-card";
import { PointCardSkeletonList } from "@/shared/ui";
import { BioHistoryTimeline } from "@/features/profile";
import { UserBadges } from "@/shared/ui/user-badges";
export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const raw = params.username;
    const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";
    const { t } = useTranslation();
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const { data: currentProfile, isLoading: profileLoading } = useProfileQuery();
    const currentUserId = currentProfile ? Number(currentProfile.userId) : null;
    const [user, setUser] = useState<SearchUserResult | null>(null);
    const [loading, setLoading] = useState(true);
    const targetId = user?.id ?? 0;
    const { data: stats, refetch: refetchStats } = useSubscriptionStatsQuery(targetId, {
        enabled: Boolean(user?.id),
    });
    const { data: points = [], isLoading: pointsLoading, refetch: refetchPoints, } = usePointsQuery(user ? user.id : undefined, { enabled: Boolean(user?.id) });
    const { data: bioHistory = [], isLoading: bioHistoryLoading, error: bioHistoryError, } = useBioHistoryQuery(user?.username ?? null, { enabled: Boolean(user?.username) });
    const followMutation = useFollowMutation();
    const unfollowMutation = useUnfollowMutation();
    const followersModal = useUserModal();
    const followingModal = useUserModal();
    const { followingStates, actionLoadingStates, followStatesLoading, initializeFollowingStates, handleFollowToggle } = useFollowManagement();
    useEffect(() => {
        if (!segment || profileLoading)
            return;
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const isAuthenticated = await checkAuth();
                if (!isAuthenticated) {
                    router.push("/auth");
                    return;
                }
                if (/^\d+$/.test(segment)) {
                    const byId = await authApi.getUserById(Number(segment));
                    router.replace(userProfilePath(byId.username));
                    return;
                }
                const userData = await authApi.getUserByUsername(segment);
                if (currentUserId !== null && userData.id === currentUserId) {
                    router.replace("/profile");
                    return;
                }
                setUser(userData);
            }
            catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
                const isStillAuth = await checkAuth();
                if (!isStillAuth) {
                    router.push("/auth");
                }
            }
            finally {
                setLoading(false);
            }
        };
        void fetchUserData();
    }, [segment, profileLoading, currentUserId, router, checkAuth]);
    const handleFollowToggleMain = () => {
        if (!user?.id)
            return;
        const isFollowing = stats?.isFollowing || false;
        const mutation = isFollowing ? unfollowMutation : followMutation;
        mutation.mutate(user.id, {
            onSuccess: () => {
                refetchStats();
            },
        });
    };
    const handleShowFollowers = async () => {
        if (!user?.id)
            return;
        const users = await followersModal.openModal(user.id, "followers");
        await initializeFollowingStates(users);
    };
    const handleShowFollowing = async () => {
        if (!user?.id)
            return;
        const users = await followingModal.openModal(user.id, "following");
        await initializeFollowingStates(users);
    };
    const handleFollowToggleInModal = async (targetUserId: number, isCurrentlyFollowing: boolean) => {
        await handleFollowToggle(targetUserId, isCurrentlyFollowing);
    };
    if (loading) {
        return <Loading />;
    }
    if (!user && !stats) {
        return (<div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-text-muted">{t("profile.userNotFound")}</div>
      </div>);
    }
    const isFollowing = stats?.isFollowing || false;
    const actionLoading = followMutation.isPending || unfollowMutation.isPending;
    const avatarUrl = user?.avatar &&
        (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")
            ? user.avatar
            : `${process.env.NEXT_PUBLIC_API_URL ?? ""}${user.avatar}`);
    return (<div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-4xl px-0 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          {stats && (<div className="grid grid-cols-2 gap-2 px-0 sm:flex sm:w-auto sm:gap-4">
              <button type="button" onClick={handleShowFollowers} className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3 py-3.5 transition-colors hover:bg-accent touch-target sm:min-h-0 sm:gap-3 sm:px-4 sm:py-3">
                <Users className="h-4 w-4 shrink-0 text-text-muted sm:h-5 sm:w-5"/>
                <div className="min-w-0 text-left">
                  <div className="text-base font-bold tabular-nums text-text-main sm:text-2xl">
                    {stats.followersCount}
                  </div>
                  <div className="truncate text-xs text-text-muted sm:text-sm">{t("profile.followers")}</div>
                </div>
              </button>

              <button type="button" onClick={handleShowFollowing} className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3 py-3.5 transition-colors hover:bg-accent touch-target sm:min-h-0 sm:gap-3 sm:px-4 sm:py-3">
                <Users className="h-4 w-4 shrink-0 text-text-muted sm:h-5 sm:w-5"/>
                <div className="min-w-0 text-left">
                  <div className="text-base font-bold tabular-nums text-text-main sm:text-2xl">
                    {stats.followingCount}
                  </div>
                  <div className="truncate text-xs text-text-muted sm:text-sm">{t("profile.following")}</div>
                </div>
              </button>
            </div>)}

          <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 sm:mb-6 sm:flex-row sm:items-center sm:gap-4 sm:pb-6">
              <div className="shrink-0">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted sm:h-24 sm:w-24 sm:border-4">
                  {avatarUrl ? (<img src={avatarUrl} alt={user?.username ?? ""} className="h-full w-full object-cover"/>) : (<div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <User className="h-8 w-8 text-primary/50 sm:h-12 sm:w-12" aria-hidden/>
                    </div>)}
                </div>
              </div>

              <div className="min-w-0 w-full flex-1 sm:w-auto">
                <h1 className="flex min-w-0 items-center gap-2 truncate text-xl font-bold text-text-main sm:text-3xl">
                  <span className="truncate">{user?.username || "User"}</span>
                  {user ? (<UserBadges role={user.role} createdPointsCount={user.createdPointsCount} className="shrink-0"/>) : null}
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-muted break-all sm:mt-1 sm:text-sm">
                  {user?.email}
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
                {user?.username ? (<ShareLinkButton path={userProfilePath(user.username)}/>) : null}
                <Button type="button" variant="secondary" className="min-w-0 flex-1 touch-target gap-2 sm:flex-initial" disabled={!user?.id} onClick={() => user?.id && router.push(`/chats/compose?with=${user.id}`)}>
                  <MessagesSquare className="h-4 w-4 shrink-0" aria-hidden/>
                  {t("chats.messageUser")}
                </Button>
                <Button onClick={handleFollowToggleMain} disabled={actionLoading || !user?.id} variant={isFollowing ? "destructive" : "outline"} className="min-w-0 flex-1 touch-target gap-2 sm:flex-initial">
                  {actionLoading ? "..." : isFollowing ? t("profile.unfollow") : t("profile.follow")}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <User className="h-4 w-4 shrink-0"/>
                  {t("profile.username")}
                </label>
                <p className="flex flex-wrap items-center gap-1.5 hyphens-auto font-medium text-text-main">
                  <span>{user?.username || "-"}</span>
                  {user ? (<UserBadges role={user.role} createdPointsCount={user.createdPointsCount} className="shrink-0"/>) : null}
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-muted">
                  <Mail className="h-4 w-4 shrink-0"/>
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

          <BioHistoryTimeline entries={bioHistory} isLoading={bioHistoryLoading} error={bioHistoryError as Error | null} canDelete={false}/>

          <div>
            <h2 className="mb-3 flex items-center gap-2 px-4 text-base font-semibold text-text-main sm:mb-4 sm:px-0 sm:text-lg">
              <MapPin className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"/>
              <span className="truncate">
                {t("profile.userPoints")} {user?.username}
              </span>
            </h2>

            {pointsLoading ? (<PointCardSkeletonList ariaLabel={t("profile.loadingPoints")} className="px-4 sm:px-0"/>) : points.length === 0 ? (<div className="px-4 py-8 text-center text-text-muted sm:px-0">{t("profile.noUserPoints")}</div>) : (<div className="-mx-3 space-y-4 sm:mx-0 sm:space-y-6">
                {points.map((point) => (<PointCard key={point.id} point={point} showMapLink={isFollowing} onFavoriteChange={() => refetchPoints()} onPointUpdate={() => refetchPoints()}/>))}
              </div>)}
          </div>
        </div>
      </div>

      <UserListModal isOpen={followersModal.showModal} onClose={followersModal.closeModal} title={t("profile.followers")} users={followersModal.users} loading={followersModal.loading || followStatesLoading} emptyMessage={t("profile.noFollowers")} currentUserId={currentUserId || undefined} followingStates={followingStates} actionLoadingStates={actionLoadingStates} onFollowToggle={handleFollowToggleInModal} followLabel={t("profile.follow")} unfollowLabel={t("profile.unfollow")}/>

      <UserListModal isOpen={followingModal.showModal} onClose={followingModal.closeModal} title={t("profile.following")} users={followingModal.users} loading={followingModal.loading || followStatesLoading} emptyMessage={t("profile.noFollowing")} currentUserId={currentUserId || undefined} followingStates={followingStates} actionLoadingStates={actionLoadingStates} onFollowToggle={handleFollowToggleInModal} followLabel={t("profile.follow")} unfollowLabel={t("profile.unfollow")}/>
    </div>);
}
