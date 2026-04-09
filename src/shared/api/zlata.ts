import { apiClient } from "./client";
import { getApiUrl } from "../lib/utils/api-url";
export interface ZlataTagBrief {
    id: number;
    name: string;
}
export interface ZlataAsset {
    id: string;
    url: string;
    createdAt: string;
    uploaderId: number;
    tags: ZlataTagBrief[];
}
export const zlataApi = {
    getAssets: (tags?: string) => apiClient.get<ZlataAsset[]>("/zlata/assets", {
        params: tags?.trim() ? { tags: tags.trim() } : {},
    }),
    getTags: () => apiClient.get<ZlataTagBrief[]>("/zlata/tags"),
    createTag: (name: string) => apiClient.post<ZlataTagBrief>("/zlata/tags", { name }),
    deleteTag: (id: number) => apiClient.delete(`/zlata/tags/${id}`),
    uploadAssets: (files: File[]) => {
        const formData = new FormData();
        for (const file of files) {
            formData.append("files", file);
        }
        return apiClient.post<ZlataAsset[]>("/zlata/assets", formData);
    },
    attachTag: (assetId: string, body: {
        tagId?: number;
        name?: string;
    }) => apiClient.post<ZlataAsset>(`/zlata/assets/${assetId}/tags`, body),
    detachTag: (assetId: string, tagId: number) => apiClient.delete(`/zlata/assets/${assetId}/tags/${tagId}`),
    deleteAsset: (assetId: string) => apiClient.delete(`/zlata/assets/${assetId}`),
};
export function zlataImageUrl(urlPath: string): string {
    if (urlPath.startsWith("http")) {
        return urlPath;
    }
    return `${getApiUrl()}${urlPath.startsWith("/") ? "" : "/"}${urlPath}`;
}
