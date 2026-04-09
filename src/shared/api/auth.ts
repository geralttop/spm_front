import { apiClient } from "./client";
export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface VerifyCodeRequest {
    email: string;
    code: string;
}
export interface AuthResponse {
    message?: string;
    email?: string;
    accessToken?: string;
}
export interface ProfileResponse {
    sub: string;
    userId: string;
    email: string;
    role: string;
    username?: string;
    bio?: string;
    avatar?: string;
    sidebarOrder?: string[];
    createdPointsCount?: number;
}
export interface UpdateProfileRequest {
    username?: string;
    bio?: string;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
}
export interface SearchUserResult {
    id: number;
    username: string;
    email: string;
    bio: string | null;
    avatar?: string;
    role?: string;
    createdPointsCount?: number;
}
export interface BioHistoryEntry {
    id: number;
    text: string;
    createdAt: string;
}
export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/register", data);
        return response.data;
    },
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/login", data);
        return response.data;
    },
    verifyEmail: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/verify-email", data);
        return response.data;
    },
    verifyLogin: async (data: VerifyCodeRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/verify-login", data);
        return response.data;
    },
    getProfile: async (): Promise<ProfileResponse> => {
        const response = await apiClient.get<ProfileResponse>("/auth/profile");
        return response.data;
    },
    updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
        const response = await apiClient.patch<ProfileResponse>("/auth/update-profile", data);
        return response.data;
    },
    searchUsers: async (query: string): Promise<SearchUserResult[]> => {
        const response = await apiClient.get<SearchUserResult[]>("/auth/search", {
            params: { q: query }
        });
        return response.data;
    },
    updateSidebarOrder: async (sidebarOrder: string[]): Promise<{
        message: string;
        sidebarOrder: string[];
    }> => {
        const response = await apiClient.patch<{
            message: string;
            sidebarOrder: string[];
        }>("/auth/sidebar-order", { sidebarOrder });
        return response.data;
    },
    getUserById: async (id: number): Promise<SearchUserResult> => {
        const response = await apiClient.get<SearchUserResult>(`/auth/user/${id}`);
        return response.data;
    },
    getUserByUsername: async (username: string): Promise<SearchUserResult> => {
        const encoded = encodeURIComponent(username);
        const response = await apiClient.get<SearchUserResult>(`/auth/user/username/${encoded}`);
        return response.data;
    },
    logout: async (): Promise<{
        message: string;
    }> => {
        const response = await apiClient.post<{
            message: string;
        }>("/auth/logout");
        return response.data;
    },
    forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/forgot-password", data);
        return response.data;
    },
    resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/reset-password", data);
        return response.data;
    },
    uploadAvatar: async (file: File): Promise<{
        message: string;
        avatarUrl: string;
    }> => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post<{
            message: string;
            avatarUrl: string;
        }>("/auth/upload-avatar", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    deleteAvatar: async (): Promise<{
        message: string;
    }> => {
        const response = await apiClient.delete<{
            message: string;
        }>("/auth/delete-avatar");
        return response.data;
    },
    getMyBioHistory: async (): Promise<BioHistoryEntry[]> => {
        const response = await apiClient.get<BioHistoryEntry[]>("/auth/bio-history");
        return response.data;
    },
    getBioHistoryByUsername: async (username: string): Promise<BioHistoryEntry[]> => {
        const encoded = encodeURIComponent(username);
        const response = await apiClient.get<BioHistoryEntry[]>(`/auth/user/username/${encoded}/bio-history`);
        return response.data;
    },
    deleteBioHistoryEntry: async (id: number): Promise<{
        message: string;
    }> => {
        const response = await apiClient.delete<{
            message: string;
        }>(`/auth/bio-history/${id}`);
        return response.data;
    },
};
