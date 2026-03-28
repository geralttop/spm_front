import { apiClient } from "./client";
import { getApiUrl } from "../lib/utils/api-url";

export interface VinlandAsset {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  uploaderId: number;
}

export const vinlandApi = {
  getAssets: () => apiClient.get<VinlandAsset[]>("/vinland/assets"),

  uploadAssets: (files: File[]) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    return apiClient.post<VinlandAsset[]>("/vinland/assets", formData);
  },

  reorder: (orderedIds: string[]) =>
    apiClient.patch<VinlandAsset[]>("/vinland/assets/reorder", { orderedIds }),

  updateCaption: (id: string, caption: string | null) =>
    apiClient.patch<VinlandAsset>(`/vinland/assets/${id}`, { caption }),

  deleteAsset: (id: string) => apiClient.delete(`/vinland/assets/${id}`),
};

export function vinlandImageUrl(urlPath: string): string {
  if (urlPath.startsWith("http")) {
    return urlPath;
  }
  return `${getApiUrl()}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
}
