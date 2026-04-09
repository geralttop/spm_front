import { apiClient } from './client';
export interface CreateReportRequest {
    type: 'point' | 'comment' | 'user';
    reason: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
    description?: string;
    pointId?: string;
    commentId?: number;
    reportedUserId?: number;
}
export interface Report {
    id: number;
    type: 'point' | 'comment' | 'user';
    reason: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
    updatedAt: string;
    reporter: {
        id: number;
        username: string;
        email: string;
    };
    point?: {
        id: string;
        name: string;
        author: {
            id: number;
            username: string;
        };
    };
    comment?: {
        id: number;
        content: string;
        author: {
            id: number;
            username: string;
        };
    };
    reportedUser?: {
        id: number;
        username: string;
        email: string;
        isBlocked: boolean;
    };
    reviewedBy?: {
        id: number;
        username: string;
    };
    adminNotes?: string;
}
export const reportsApi = {
    create: async (data: CreateReportRequest): Promise<Report> => {
        const response = await apiClient.post('/reports', data);
        return response.data;
    },
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        reports: Report[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> => {
        const response = await apiClient.get('/admin/reports', { params });
        return response.data;
    },
    getById: async (id: number): Promise<Report> => {
        const response = await apiClient.get(`/admin/reports/${id}`);
        return response.data;
    },
    update: async (id: number, data: {
        status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
        adminNotes?: string;
    }): Promise<Report> => {
        const response = await apiClient.put(`/admin/reports/${id}`, data);
        return response.data;
    },
    resolve: async (id: number, data: {
        action: 'delete' | 'block' | 'dismiss';
        adminNotes?: string;
    }): Promise<Report> => {
        const response = await apiClient.post(`/admin/reports/${id}/resolve`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/reports/${id}`);
    },
};
export const usersApi = {
    block: async (id: number, reason?: string): Promise<any> => {
        const response = await apiClient.post(`/admin/users/${id}/block`, { reason });
        return response.data;
    },
    unblock: async (id: number): Promise<any> => {
        const response = await apiClient.post(`/admin/users/${id}/unblock`);
        return response.data;
    },
    getBlocked: async (): Promise<any[]> => {
        const response = await apiClient.get('/admin/users/blocked');
        return response.data;
    },
};
