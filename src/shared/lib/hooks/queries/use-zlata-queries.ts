import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zlataApi } from "@/shared/api/zlata";

const zlataKey = ["zlata"] as const;

export function useZlataAssetsQuery(tagsFilter?: string) {
  return useQuery({
    queryKey: [...zlataKey, "assets", tagsFilter ?? ""],
    queryFn: async () => {
      const res = await zlataApi.getAssets(tagsFilter);
      return res.data;
    },
  });
}

export function useZlataTagsQuery() {
  return useQuery({
    queryKey: [...zlataKey, "tags"],
    queryFn: async () => {
      const res = await zlataApi.getTags();
      return res.data;
    },
  });
}

function useInvalidateZlata() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...zlataKey] });
  };
}

export function useCreateZlataTagMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: (name: string) => zlataApi.createTag(name).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteZlataTagMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: (id: number) => zlataApi.deleteTag(id),
    onSuccess: () => invalidate(),
  });
}

export function useUploadZlataAssetMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: (files: File[]) =>
      zlataApi.uploadAssets(files).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useAttachZlataTagMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: ({
      assetId,
      body,
    }: {
      assetId: string;
      body: { tagId?: number; name?: string };
    }) => zlataApi.attachTag(assetId, body).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useDetachZlataTagMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: ({ assetId, tagId }: { assetId: string; tagId: number }) =>
      zlataApi.detachTag(assetId, tagId),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteZlataAssetMutation() {
  const invalidate = useInvalidateZlata();
  return useMutation({
    mutationFn: (assetId: string) => zlataApi.deleteAsset(assetId),
    onSuccess: () => invalidate(),
  });
}
