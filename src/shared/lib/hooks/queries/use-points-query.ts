import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsApi, type CreatePointRequest } from "@/shared/api";
import { useToast } from "../use-toast";

export function usePointsQuery(userId?: number) {
  return useQuery({
    queryKey: ["points", userId],
    queryFn: () => pointsApi.getAll(userId),
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
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreatePointRequest) => pointsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success("Точка создана");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Ошибка создания точки");
    },
  });
}
