/**
 * Экспорт API клиентов и утилит
 */
export { apiClient } from "./client";
export { authApi } from "./auth";
export { pointsApi, categoriesApi, containersApi } from "./points";
export { subscriptionsApi } from "./subscriptions";
export { favoritesApi } from "./favorites";
export { feedApi } from "./feed";
export { commentsApi } from "./comments";
export { reportsApi, usersApi } from "./reports";
export { settingsApi } from "./settings-api";
export { zlataApi, zlataImageUrl } from "./zlata";
export type { ZlataAsset, ZlataTagBrief } from "./zlata";
export { vinlandApi, vinlandImageUrl } from "./vinland";
export type { VinlandAsset } from "./vinland";
export { BaseApi } from "./base-api";
export type {
  RegisterRequest,
  LoginRequest,
  VerifyCodeRequest,
  AuthResponse,
  ProfileResponse,
  UpdateProfileRequest,
  SearchUserResult,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  BioHistoryEntry,
} from "./auth";
export type {
  Point,
  PointPhoto,
  CreatePointRequest,
  UpdatePointRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Container,
  CreateContainerRequest,
  UpdateContainerRequest,
  UploadPointPhotosPayload,
} from "./points";
export type { SubscriptionUser, SubscriptionStats } from "./subscriptions";
export type { FavoritePoint, FavoriteCheckResponse } from "./favorites";
export type { FeedResponse } from "./feed";
export type { Comment, CreateCommentDto, UpdateCommentDto } from "./comments";
export type { Report, CreateReportRequest } from "./reports";
export type { MapSettings, PointCardInitialView } from "./settings-api";