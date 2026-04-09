import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type UpdateProfileRequest } from "@/shared/api";
export function useProfileQuery() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => authApi.getProfile(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });
}
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["bio-history"] });
        },
    });
}
