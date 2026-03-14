import { apiClient } from "./client";
import { BaseApi } from "./base-api";

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
    color: string;
  } | null;
  container?: Container | null;
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  commentsCount?: number;
}

export interface CreatePointRequest {
  name: string;
  description?: string;
  lng: number;
  lat: number;
  containerId: string;
  categoryId: number;
}

export interface UpdatePointRequest {
  name?: string;
  description?: string;
  lng?: number;
  lat?: number;
  containerId?: string;
  categoryId?: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Container {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
}

export interface CreateContainerRequest {
  title: string;
  description?: string;
}

export interface UpdateContainerRequest {
  title?: string;
  description?: string;
}

// Points API with custom getAll method
class PointsApi extends BaseApi<Point, CreatePointRequest, UpdatePointRequest> {
  async getAll(params?: Record<string, any>): Promise<Point[]> {
    const response = await apiClient.get<Point[]>("/points", { params });
    return response.data;
  }
}

export const pointsApi = new PointsApi("/points", apiClient);

export const categoriesApi = new BaseApi<Category, CreateCategoryRequest, UpdateCategoryRequest>(
  "/categories",
  apiClient
);

// Containers API with custom delete method
class ContainersApi extends BaseApi<Container, CreateContainerRequest, UpdateContainerRequest> {
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/containers/${id}`);
  }
}

export const containersApi = new ContainersApi("/containers", apiClient);
