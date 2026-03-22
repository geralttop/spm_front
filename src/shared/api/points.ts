import { apiClient } from "./client";
import { BaseApi } from "./base-api";

export interface PointPhoto {
  id: string;
  url: string;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
}

export interface Point {
  id: string;
  name: string;
  description?: string;
  address?: string;
  /** Соотношение сторон медиа-блока (карта + фото), из первого снимка */
  mediaAspectW?: number | null;
  mediaAspectH?: number | null;
  photos?: PointPhoto[];
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
  /** null — системная категория (сидер), иначе владелец */
  authorId?: number | null;
}

export interface Container {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  /** null — системный контейнер (сидер), иначе владелец */
  authorId?: number | null;
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

export interface UploadPointPhotosPayload {
  files: File[];
  /** Размеры в том же порядке, что и files */
  dimensions: { width: number; height: number }[];
}

// Points API with custom getAll method
class PointsApi extends BaseApi<Point, CreatePointRequest, UpdatePointRequest> {
  async getAll(params?: Record<string, any>): Promise<Point[]> {
    const response = await apiClient.get<Point[]>("/points", { params });
    return response.data;
  }

  async uploadPhotos(
    pointId: string,
    payload: UploadPointPhotosPayload
  ): Promise<Point> {
    const formData = new FormData();
    for (const f of payload.files) {
      formData.append("files", f);
    }
    formData.append("dimensions", JSON.stringify(payload.dimensions));
    const response = await apiClient.post<Point>(
      `/points/${pointId}/photos`,
      formData,
      {
        transformRequest: [
          (data, headers) => {
            if (typeof FormData !== "undefined" && data instanceof FormData) {
              delete (headers as Record<string, unknown>)["Content-Type"];
            }
            return data;
          },
        ],
      }
    );
    return response.data;
  }

  async deletePointPhoto(pointId: string, photoId: string): Promise<Point> {
    const response = await apiClient.delete<Point>(
      `/points/${pointId}/photos/${photoId}`
    );
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
