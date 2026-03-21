/**
 * Базовый URL API для axios.
 *
 * Прод (Vercel): обязательно задайте NEXT_PUBLIC_API_URL=https://back.a2015.ru
 * — иначе в браузере будет использован fallback (хост:3000), что на Vercel неверно.
 *
 * Локально без .env: в браузере — текущий хост:3000 (фронт 3001, бэк 3000).
 */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000`;
  }

  return 'http://localhost:3000';
}
