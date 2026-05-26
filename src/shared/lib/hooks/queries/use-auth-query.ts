import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginRequest, type RegisterRequest, type VerifyCodeRequest, type ForgotPasswordRequest, type ResetPasswordRequest } from '@/shared/api';
import { useAuthStore } from '@/shared/lib/store';
import { clearUserSessionCache } from './clear-user-session-cache';
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
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyEmail(data),
    onSuccess: (response) => {
      clearUserSessionCache(queryClient);
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
    },
  });
};

export const useVerifyLoginMutation = () => {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  
  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyLogin(data),
    onSuccess: (response) => {
      clearUserSessionCache(queryClient);
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearUserSessionCache(queryClient);
      clearAuth();
    },
  });
};
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
};
