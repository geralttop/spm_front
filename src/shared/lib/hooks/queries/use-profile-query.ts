import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type UpdateProfileRequest } from "@/shared/api";
import type { ProfileResponse } from "@/shared/types";
import type { PointAuthor } from "@/shared/lib/user-badge-types";
import type { Point } from "@/shared/api";

function patchProfileAvatar(
    queryClient: ReturnType<typeof useQueryClient>,
    avatar: string | undefined,
) {
    queryClient.setQueryData<ProfileResponse>(["profile"], (current) =>
        current ? { ...current, avatar } : current,
    );
}

function patchAuthorAvatar(author: PointAuthor, avatar: string | undefined): PointAuthor {
    return {
        ...author,
        avatar: avatar ?? null,
    };
}

function patchAuthorAvatarInCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    authorId: number,
    avatar: string | undefined,
) {
    queryClient.setQueriesData<Point[]>({ queryKey: ["points"] }, (points) => {
        if (!points) {
            return points;
        }
        return points.map((point) =>
            point.author.id === authorId
                ? { ...point, author: patchAuthorAvatar(point.author, avatar) }
                : point,
        );
    });

    queryClient.setQueriesData<Point[]>({ queryKey: ["favorites"] }, (points) => {
        if (!points) {
            return points;
        }
        return points.map((point) =>
            point.author.id === authorId
                ? { ...point, author: patchAuthorAvatar(point.author, avatar) }
                : point,
        );
    });

    queryClient.setQueriesData<Point>({ queryKey: ["point"] }, (point) => {
        if (!point || point.author.id !== authorId) {
            return point;
        }
        return { ...point, author: patchAuthorAvatar(point.author, avatar) };
    });

    queryClient.setQueriesData<{ pages: Array<{ points: Point[] }> }>(
        { queryKey: ["feed"] },
        (data) => {
            if (!data?.pages) {
                return data;
            }
            return {
                ...data,
                pages: data.pages.map((page) => ({
                    ...page,
                    points: page.points.map((point) =>
                        point.author.id === authorId
                            ? { ...point, author: patchAuthorAvatar(point.author, avatar) }
                            : point,
                    ),
                })),
            };
        },
    );
}

function syncAvatarAcrossCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    avatar: string | undefined,
) {
    patchProfileAvatar(queryClient, avatar);
    const profile = queryClient.getQueryData<ProfileResponse>(["profile"]);
    const authorId = profile ? Number(profile.userId) : NaN;
    if (!Number.isNaN(authorId) && authorId > 0) {
        patchAuthorAvatarInCaches(queryClient, authorId, avatar);
    }
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
            syncAvatarAcrossCaches(queryClient, data.avatarUrl);
        },
    });
}
export function useDeleteAvatarMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authApi.deleteAvatar(),
        onSuccess: () => {
            syncAvatarAcrossCaches(queryClient, undefined);
        },
    });
}
