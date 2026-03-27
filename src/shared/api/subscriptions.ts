import { apiClient } from "./client";

export interface SubscriptionUser {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  /** С бэкенда; для старых ответов может отсутствовать */
  avatar?: string | null;
}

export interface SubscriptionStats {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export const subscriptionsApi = {
  follow: async (userId: number): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/subscriptions/follow/${userId}`);
    return response.data;
  },

  unfollow: async (userId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/subscriptions/unfollow/${userId}`);
    return response.data;
  },

  getFollowers: async (userId: number): Promise<SubscriptionUser[]> => {
    const response = await apiClient.get<SubscriptionUser[]>(`/subscriptions/followers/${userId}`);
    return response.data;
  },

  getFollowing: async (userId: number): Promise<SubscriptionUser[]> => {
    const response = await apiClient.get<SubscriptionUser[]>(`/subscriptions/following/${userId}`);
    return response.data;
  },

  getStats: async (userId: number): Promise<SubscriptionStats> => {
    const response = await apiClient.get<SubscriptionStats>(`/subscriptions/stats/${userId}`);
    return response.data;
  },

  isFollowing: async (userId: number): Promise<{ isFollowing: boolean }> => {
    const response = await apiClient.get<{ isFollowing: boolean }>(`/subscriptions/is-following/${userId}`);
    return response.data;
  },
};
