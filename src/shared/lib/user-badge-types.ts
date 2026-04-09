export type AppUserRole = "user" | "admin";
export interface UserBadgeFields {
    role?: AppUserRole | string;
    createdPointsCount?: number;
}
export interface PointAuthor extends UserBadgeFields {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
}
