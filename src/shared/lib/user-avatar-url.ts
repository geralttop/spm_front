import { getApiUrl } from "./utils/api-url";

/** Полный URL аватара пользователя для <img src> или null. */
export function userAvatarSrc(
  avatar: string | null | undefined,
  apiBase: string = getApiUrl(),
): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }
  return `${apiBase}${avatar}`;
}
