import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type UpdateProfileRequest } from "@/shared/api";
import { useToast } from "../use-toast";

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кэше (было cacheTime)
    retry: 1, // Повторить только 1 раз при ошибке
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Профиль обновлен");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Ошибка обновления профиля");
    },
  });
}
