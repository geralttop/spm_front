import { apiClient } from "./client";

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
    icon?: string;
  };
  container?: {
    id: string;
    title: string;
  };
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  addedAt: string;
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}

export const favoritesApi = {
  getAll: async (): Promise<FavoritePoint[]> => {
    const response = await apiClient.get<FavoritePoint[]>("/favorites");
    return response.data;
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
