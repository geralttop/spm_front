import type { Category } from './category';
import type { Container } from './container';
import type { User } from './user';

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
  category?: Category | null;
  container?: Container | null;
  author: User;
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
