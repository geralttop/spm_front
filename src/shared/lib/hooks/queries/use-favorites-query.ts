import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/shared/api";

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

  const addMutation = useMutation({
    mutationFn: (pointId: string) => favoritesApi.add(pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (pointId: string) => favoritesApi.remove(pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    add: addMutation.mutate,
    remove: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
