import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsApi, type CreatePointRequest } from "@/shared/api";

export function usePointsQuery(userId?: number) {
  return useQuery({
    queryKey: ["points", userId],
    queryFn: () =>
      pointsApi.getAll(userId ? { userId } : undefined),
  });
}

export function usePointQuery(id: string) {
  return useQuery({
    queryKey: ["point", id],
    queryFn: () => pointsApi.getById(id),
  });
}

export function useCreatePointMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePointRequest) => pointsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
}
