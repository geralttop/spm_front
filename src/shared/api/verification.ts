import { apiClient } from "./client";

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export type VerificationRequest = {
  id: number;
  userId: number;
  reason: string;
  links?: string | null;
  status: VerificationRequestStatus;
  adminId?: number | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string | null;
};

export type CreateVerificationRequestPayload = {
  reason: string;
  links?: string;
};

export const verificationApi = {
  getMy: async (): Promise<VerificationRequest | null> => {
    const response = await apiClient.get<VerificationRequest | null>("/verification/my");
    return response.data;
  },
  request: async (payload: CreateVerificationRequestPayload): Promise<VerificationRequest> => {
    const response = await apiClient.post<VerificationRequest>("/verification/request", payload);
    return response.data;
  },
  revokeMy: async (): Promise<{ ok: boolean }> => {
    const response = await apiClient.delete<{ ok: boolean }>("/verification/my");
    return response.data;
  },
};

