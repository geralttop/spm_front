/** Роль пользователя (как в API). */
export type AppUserRole = "user" | "admin";

/** Поля бэка для отображения бейджей у автора / в профиле. */
export interface UserBadgeFields {
  role?: AppUserRole | string;
  createdPointsCount?: number;
}

/** Автор точки/избранного в ответах API. */
export interface PointAuthor extends UserBadgeFields {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}
