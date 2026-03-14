import { apiClient } from "./client";

export interface FeedPoint {
  id: string;
  name: string;
  description: string;
  address: string;
  coords: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: string;
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
  container: {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
  } | null;
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface FeedResponse {
  points: FeedPoint[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const feedApi = {
  getFeed: async (page: number = 1, limit: number = 10): Promise<FeedResponse> => {
    const response = await apiClient.get<FeedResponse>("/points/feed", {
      params: { page, limit },
    });
    return response.data;
  },
};
