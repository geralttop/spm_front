import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vinlandApi } from "@/shared/api/vinland";

const vinlandKey = ["vinland"] as const;

export function useVinlandAssetsQuery() {
  return useQuery({
    queryKey: [...vinlandKey, "assets"],
    queryFn: async () => {
      const res = await vinlandApi.getAssets();
      return res.data;
    },
  });
}

function useInvalidateVinland() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...vinlandKey] });
  };
}

export function useUploadVinlandAssetsMutation() {
  const invalidate = useInvalidateVinland();
  return useMutation({
    mutationFn: (files: File[]) =>
      vinlandApi.uploadAssets(files).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useReorderVinlandMutation() {
  const invalidate = useInvalidateVinland();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      vinlandApi.reorder(orderedIds).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateVinlandCaptionMutation() {
  const invalidate = useInvalidateVinland();
  return useMutation({
    mutationFn: ({
      id,
      caption,
    }: {
      id: string;
      caption: string | null;
    }) => vinlandApi.updateCaption(id, caption).then((r) => r.data),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteVinlandAssetMutation() {
  const invalidate = useInvalidateVinland();
  return useMutation({
    mutationFn: (id: string) => vinlandApi.deleteAsset(id),
    onSuccess: () => invalidate(),
  });
}
