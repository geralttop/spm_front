export type {
  User,
  ProfileResponse,
  UpdateProfileRequest,
  SearchUserResult,
} from "@/shared/types/user";

export {
  registerSchema,
  loginSchema,
  createUpdateProfileSchema,
  verifyCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/shared/schemas/user.schema";

export type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  VerifyCodeInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/shared/schemas/user.schema";

export { useProfileQuery, useUpdateProfileMutation } from "@/shared/lib/hooks/queries";

