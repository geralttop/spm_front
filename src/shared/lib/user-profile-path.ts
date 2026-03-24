/** Путь страницы профиля пользователя по имени (сегмент URL-кодируется). */
export function userProfilePath(username: string): string {
  return `/user/${encodeURIComponent(username)}`;
}
