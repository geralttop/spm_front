import { apiClient } from './client';
import type { UserBadgeFields } from '@/shared/lib/user-badge-types';
export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    pointId: string;
    author: {
        id: number;
        username: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        avatar?: string | null;
    } & UserBadgeFields;
    point?: {
        id: string;
        name: string;
        description: string;
    };
}
export interface CreateCommentDto {
    content: string;
}
export interface UpdateCommentDto {
    content: string;
}
export const commentsApi = {
    getByPoint: async (pointId: string): Promise<Comment[]> => {
        const response = await apiClient.get(`/points/${pointId}/comments`);
        return response.data;
    },
    getMyComments: async (): Promise<Comment[]> => {
        const response = await apiClient.get('/comments/my');
        return response.data;
    },
    create: async (pointId: string, data: CreateCommentDto): Promise<Comment> => {
        const response = await apiClient.post(`/points/${pointId}/comments`, data);
        return response.data;
    },
    update: async (pointId: string, commentId: number, data: UpdateCommentDto): Promise<Comment> => {
        const response = await apiClient.patch(`/points/${pointId}/comments/${commentId}`, data);
        return response.data;
    },
    delete: async (pointId: string, commentId: number): Promise<void> => {
        await apiClient.delete(`/points/${pointId}/comments/${commentId}`);
    },
};
