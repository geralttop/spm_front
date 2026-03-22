import type { Category } from './category';
import type { Container } from './container';
import type { User } from './user';

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
  mediaAspectW?: number | null;
  mediaAspectH?: number | null;
  photos?: PointPhoto[];
  coords: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: string;
  category?: Category | null;
  container?: Container | null;
  author: User;
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
