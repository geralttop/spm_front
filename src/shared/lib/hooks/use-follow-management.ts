import { useState } from "react";
import { subscriptionsApi, type SubscriptionUser } from "@/shared/api";
export function useFollowManagement() {
    const [followingStates, setFollowingStates] = useState<Record<number, boolean>>({});
    const [actionLoadingStates, setActionLoadingStates] = useState<Record<number, boolean>>({});
    const [followStatesLoading, setFollowStatesLoading] = useState(false);
    const initializeFollowingStates = async (users: SubscriptionUser[]) => {
        if (users.length === 0) {
            setFollowingStates({});
            return;
        }
        setFollowStatesLoading(true);
        try {
            const followingStatesPromises = users.map(async (user) => {
                try {
                    const userStats = await subscriptionsApi.getStats(user.id);
                    return { userId: user.id, isFollowing: userStats.isFollowing || false };
                }
                catch (error) {
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
        }
        finally {
            setFollowStatesLoading(false);
        }
    };
    const initializeFollowingList = (users: SubscriptionUser[]) => {
        const initialStates: Record<number, boolean> = {};
        users.forEach((user) => {
            initialStates[user.id] = true;
        });
        setFollowingStates(initialStates);
    };
    const handleFollowToggle = async (userId: number, isCurrentlyFollowing: boolean, onSuccess?: (isFollowing: boolean) => void) => {
        setActionLoadingStates((prev) => ({ ...prev, [userId]: true }));
        try {
            if (isCurrentlyFollowing) {
                await subscriptionsApi.unfollow(userId);
                setFollowingStates((prev) => ({ ...prev, [userId]: false }));
                onSuccess?.(false);
            }
            else {
                await subscriptionsApi.follow(userId);
                setFollowingStates((prev) => ({ ...prev, [userId]: true }));
                onSuccess?.(true);
            }
        }
        catch (error) {
            console.error("Error toggling follow:", error);
        }
        finally {
            setActionLoadingStates((prev) => ({ ...prev, [userId]: false }));
        }
    };
    return {
        followingStates,
        actionLoadingStates,
        followStatesLoading,
        initializeFollowingStates,
        initializeFollowingList,
        handleFollowToggle,
    };
}
