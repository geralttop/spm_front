import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pointsApi } from "@/shared/api";

export function usePointHistoryQuery(
  pointId: string | null | undefined,
  options?: { enabled?: boolean; fromContainer?: string | null }
) {
  const trimmed = pointId?.trim();
  const fromContainer = options?.fromContainer?.trim() || undefined;

  return useQuery({
    queryKey: ["point-history", trimmed, fromContainer ?? ""],
    queryFn: () =>
      pointsApi.getHistory(trimmed!, fromContainer ? { fromContainer } : undefined),
    enabled: options?.enabled !== false && Boolean(trimmed),
    staleTime: 60 * 1000,
  });
}

export function useCreatePointHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pointId: string) => pointsApi.createHistoryEntry(pointId),
    onSuccess: (_data, pointId) => {
      queryClient.invalidateQueries({ queryKey: ["point-history", pointId] });
    },
  });
}

export function useDeletePointHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { pointId: string; historyId: string }) =>
      pointsApi.deleteHistoryEntry(args.pointId, args.historyId),
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({ queryKey: ["point-history", args.pointId] });
    },
  });
}

