import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type UpdateProfileRequest } from "@/shared/api";
import type { ProfileResponse } from "@/shared/types";

function patchProfileAvatar(
    queryClient: ReturnType<typeof useQueryClient>,
    avatar: string | undefined,
) {
    queryClient.setQueryData<ProfileResponse>(["profile"], (current) =>
        current ? { ...current, avatar } : current,
    );
}

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
export function useUploadAvatarMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => authApi.uploadAvatar(file),
        onSuccess: (data) => {
            patchProfileAvatar(queryClient, data.avatarUrl);
        },
    });
}
export function useDeleteAvatarMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authApi.deleteAvatar(),
        onSuccess: () => {
            patchProfileAvatar(queryClient, undefined);
        },
    });
}
