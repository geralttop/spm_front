import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/shared/api";
import { useToast } from "../use-toast";

export function useFavoritesQuery() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.getAll(),
  });
}

export function useFavoriteCheck(pointId: string) {
  return useQuery({
    queryKey: ["favorite", pointId],
    queryFn: () => favoritesApi.check(pointId),
    staleTime: 30000, // 30 секунд
  });
}

export function useFavoriteMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const addMutation = useMutation({
    mutationFn: (pointId: string) => favoritesApi.add(pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Добавлено в избранное");
    },
    onError: () => {
      toast.error("Ошибка при добавлении в избранное");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (pointId: string) => favoritesApi.remove(pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Удалено из избранного");
    },
    onError: () => {
      toast.error("Ошибка при удалении из избранного");
    },
  });

  return {
    add: addMutation.mutate,
    remove: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
