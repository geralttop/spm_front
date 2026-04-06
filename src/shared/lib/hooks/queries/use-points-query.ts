import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pointsApi,
  type CreatePointRequest,
  type UploadPointPhotosPayload,
} from "@/shared/api";

export function usePointsQuery(
  userId?: number,
  options?: { enabled?: boolean }
) {
  const enabledByDefault =
    userId === undefined ? true : userId > 0;
  return useQuery({
    queryKey: ["points", userId],
    queryFn: () =>
      pointsApi.getAll(userId ? { userId } : undefined),
    enabled: options?.enabled !== false && enabledByDefault,
  });
}

export function usePointQuery(
  id: string,
  options?: { fromContainer?: string | null }
) {
  const fromContainer = options?.fromContainer?.trim() || undefined;
  return useQuery({
    queryKey: ["point", id, fromContainer ?? ""],
    queryFn: () =>
      pointsApi.getById(id, fromContainer ? { fromContainer } : undefined),
    enabled: Boolean(id),
  });
}

function invalidatePointRelated(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["points"] });
  queryClient.invalidateQueries({ queryKey: ["feed"] });
  queryClient.invalidateQueries({ queryKey: ["point"] });
  queryClient.invalidateQueries({ queryKey: ["profile"] });
}

export function useCreatePointMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePointRequest) => pointsApi.create(data),
    onSuccess: () => {
      invalidatePointRelated(queryClient);
    },
  });
}

export function useUploadPointPhotosMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pointId,
      payload,
    }: {
      pointId: string;
      payload: UploadPointPhotosPayload;
    }) => pointsApi.uploadPhotos(pointId, payload),
    onSuccess: () => {
      invalidatePointRelated(queryClient);
    },
  });
}

export function useDeletePointPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pointId,
      photoId,
    }: {
      pointId: string;
      photoId: string;
    }) => pointsApi.deletePointPhoto(pointId, photoId),
    onSuccess: () => {
      invalidatePointRelated(queryClient);
    },
  });
}
