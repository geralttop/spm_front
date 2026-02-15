import { useMutation } from '@tanstack/react-query';
import { authApi, type LoginRequest, type RegisterRequest, type VerifyCodeRequest } from '@/shared/api';
import { useAuthStore } from '@/shared/lib/store';

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
};

export const useVerifyEmailMutation = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyEmail(data),
    onSuccess: (response) => {
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
    },
  });
};

export const useVerifyLoginMutation = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyLogin(data),
    onSuccess: (response) => {
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
    },
  });
};

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
    },
  });
};
