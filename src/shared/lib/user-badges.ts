export const ADMIN_BADGE_FILENAME = "admin_status.png";

/** Имя файла вехи по числу созданных точек или null. */
export function milestoneBadgeFilename(
  createdPointsCount: number | undefined,
): string | null {
  const n = createdPointsCount ?? 0;
  if (n >= 20) return "20points_status.png";
  if (n >= 15) return "15points_status.png";
  if (n >= 10) return "10points_status.png";
  if (n >= 5) return "5points_status.png";
  return null;
}

export function badgePublicUrl(filename: string): string {
  return `/badges/${filename}`;
}
