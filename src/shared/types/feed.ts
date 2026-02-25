import type { Point } from './point';

export interface FeedPoint extends Point {
  // Может содержать дополнительные поля для ленты
}

export interface FeedResponse {
  points: FeedPoint[];
  total: number;
  page: number;
  limit: number;
}
