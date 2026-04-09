import { apiClient } from "./client";
import type { PointPhoto } from "./points";
import type { PointAuthor } from "@/shared/lib/user-badge-types";
export interface FeedPoint {
    id: string;
    name: string;
    description: string;
    address: string;
    mediaAspectW?: number | null;
    mediaAspectH?: number | null;
    photos?: PointPhoto[];
    coords: {
        type: "Point";
        coordinates: [
            number,
            number
        ];
    };
    createdAt: string;
    category: {
        id: number;
        name: string;
        color: string;
    } | null;
    container: {
        id: string;
        title: string;
        description?: string;
        color?: string;
        createdAt: string;
    } | null;
    author: PointAuthor;
    commentsCount?: number;
}
export function toFeedPoint(p: Omit<FeedPoint, "description" | "address" | "category" | "container"> & {
    description?: string | null;
    address?: string | null;
    category?: FeedPoint["category"] | null | undefined;
    container?: FeedPoint["container"] | null | undefined;
}): FeedPoint {
    return {
        ...p,
        description: p.description ?? "",
        address: p.address ?? "",
        category: p.category ?? null,
        container: p.container ?? null,
    };
}
export interface FeedResponse {
    points: FeedPoint[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
export const feedApi = {
    getFeed: async (page: number = 1, limit: number = 10): Promise<FeedResponse> => {
        const response = await apiClient.get<FeedResponse>("/points/feed", {
            params: { page, limit },
        });
        return response.data;
    },
};
