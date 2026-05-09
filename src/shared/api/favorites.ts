import { apiClient } from "./client";
import type { PointAuthor } from "@/shared/lib/user-badge-types";

export interface FavoritePoint {
  id: string;
  name: string;
  description?: string;
  address?: string;
  coords: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  container?: {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
  };
  author: PointAuthor;
  addedAt: string;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}

export interface FavoritePointIdsResponse {
  pointIds: string[];
}

export const favoritesApi = {
  getAll: async (): Promise<FavoritePoint[]> => {
    const response = await apiClient.get<FavoritePoint[]>("/favorites");
    return response.data;
  },

  getPointIds: async (): Promise<string[]> => {
    const response = await apiClient.get<FavoritePointIdsResponse>("/favorites/point-ids");
    return response.data.pointIds;
  },

  add: async (pointId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/favorites/${pointId}`);
    return response.data;
  },

  remove: async (pointId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/favorites/${pointId}`);
    return response.data;
  },

  check: async (pointId: string): Promise<FavoriteCheckResponse> => {
    const response = await apiClient.get<FavoriteCheckResponse>(`/favorites/check/${pointId}`);
    return response.data;
  },
};
