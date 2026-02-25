import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string()
    .email('Некорректный email адрес')
    .min(1, 'Email обязателен'),
  password: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль не должен превышать 100 символов'),
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Имя пользователя может содержать только буквы, цифры и подчеркивание')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Некорректный email адрес')
    .min(1, 'Email обязателен'),
  password: z.string()
    .min(1, 'Пароль обязателен'),
});

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Имя пользователя может содержать только буквы, цифры и подчеркивание')
    .optional(),
  bio: z.string()
    .max(1000, 'Биография не должна превышать 1000 символов')
    .optional(),
});

export const verifyCodeSchema = z.object({
  email: z.string()
    .email('Некорректный email адрес'),
  code: z.string()
    .length(6, 'Код должен содержать 6 символов')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Некорректный email адрес')
    .min(1, 'Email обязателен'),
});

export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Некорректный email адрес'),
  code: z.string()
    .length(6, 'Код должен содержать 6 символов')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
  newPassword: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль не должен превышать 100 символов'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
