import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/shared/api";

export function useBioHistoryQuery(
  username: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const trimmed = username?.trim();
  const modeMe = trimmed == null || trimmed === "";

  return useQuery({
    queryKey: ["bio-history", modeMe ? "me" : trimmed],
    queryFn: () =>
      modeMe ? authApi.getMyBioHistory() : authApi.getBioHistoryByUsername(trimmed!),
    enabled:
      options?.enabled !== false && (modeMe || Boolean(trimmed)),
    staleTime: 60 * 1000,
  });
}

export function useDeleteBioHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => authApi.deleteBioHistoryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bio-history"] });
    },
  });
}
