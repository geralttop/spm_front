import { apiClient } from "./client";

export interface Point {
  id: string;
  name: string;
  description?: string;
  address?: string;
  coords: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  container?: {
    id: string;
    name: string;
    description?: string;
  };
}

export const pointsApi = {
  getAll: async (): Promise<Point[]> => {
    const response = await apiClient.get<Point[]>("/points");
    return response.data;
  },

  getById: async (id: string): Promise<Point> => {
    const response = await apiClient.get<Point>(`/points/${id}`);
    return response.data;
  },
};
