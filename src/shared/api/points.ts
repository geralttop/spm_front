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
    id: number;
    name: string;
    icon?: string;
    color: string;
  };
  container?: {
    id: string;
    title: string;
    description?: string;
  };
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreatePointRequest {
  name: string;
  description?: string;
  lng: number;
  lat: number;
  containerId: string;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color: string;
}

export interface Container {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export const pointsApi = {
  getAll: async (userId?: number): Promise<Point[]> => {
    const params = userId ? { userId: userId.toString() } : {};
    const response = await apiClient.get<Point[]>("/points", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Point> => {
    const response = await apiClient.get<Point>(`/points/${id}`);
    return response.data;
  },

  create: async (data: CreatePointRequest): Promise<Point> => {
    const response = await apiClient.post<Point>("/points", data);
    return response.data;
  },
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },

  create: async (data: { name: string; icon?: string; color?: string }): Promise<Category> => {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
  },
};

export const containersApi = {
  getAll: async (): Promise<Container[]> => {
    const response = await apiClient.get<Container[]>("/containers");
    return response.data;
  },

  create: async (data: { title: string; description?: string }): Promise<Container> => {
    const response = await apiClient.post<Container>("/containers", data);
    return response.data;
  },
};
