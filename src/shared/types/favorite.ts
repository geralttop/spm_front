import type { Point } from './point';
export interface FavoritePoint extends Point {
}
export interface FavoriteCheckResponse {
    isFavorite: boolean;
}
