import type { Point } from './point';

export interface FavoritePoint extends Point {
  // Может содержать дополнительные поля для избранного
}

export interface FavoriteCheckResponse {
  isFavorite: boolean;
}
