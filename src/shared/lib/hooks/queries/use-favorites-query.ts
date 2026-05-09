import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";

export function useFavoritesQuery() {
    return useQuery({
        queryKey: ["favorites"],
        queryFn: () => favoritesApi.getAll(),
    });
}

export function useFavoritePointIdsQuery() {
    const accessToken = useAuthStore((state) => state.accessToken);
    return useQuery({
        queryKey: ["favorite-point-ids"],
        queryFn: () => favoritesApi.getPointIds(),
        enabled: Boolean(accessToken),
        staleTime: 60 * 1000,
    });
}

export function useFavoriteMutation() {
    const queryClient = useQueryClient();
    const invalidateFavorites = () => {
        queryClient.invalidateQueries({ queryKey: ["favorites"] });
        queryClient.invalidateQueries({ queryKey: ["favorite-point-ids"] });
    };
    const addMutation = useMutation({
        mutationFn: (pointId: string) => favoritesApi.add(pointId),
        onSuccess: invalidateFavorites,
    });
    const removeMutation = useMutation({
        mutationFn: (pointId: string) => favoritesApi.remove(pointId),
        onSuccess: invalidateFavorites,
    });
    return {
        add: addMutation.mutate,
        remove: removeMutation.mutate,
        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
    };
}
