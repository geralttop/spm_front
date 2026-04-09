import type { Point } from './point';
export interface FeedPoint extends Point {
}
export interface FeedResponse {
    points: FeedPoint[];
    total: number;
    page: number;
    limit: number;
}
