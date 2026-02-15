import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/shared/api";

export function useSubscriptionStatsQuery(userId: number) {
  return useQuery({
    queryKey: ["subscription-stats", userId],
    queryFn: () => subscriptionsApi.getStats(userId),
  });
}

export function useFollowersQuery(userId: number) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => subscriptionsApi.getFollowers(userId),
  });
}

export function useFollowingQuery(userId: number) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => subscriptionsApi.getFollowing(userId),
  });
}

export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => subscriptionsApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUnfollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => subscriptionsApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-stats"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}
