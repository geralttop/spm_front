/**
 * Получает URL API на основе текущего окружения
 * В браузере использует текущий хост, в SSR - переменную окружения или localhost
 */
export function getApiUrl(): string {
  // В браузере определяем автоматически на основе текущего хоста
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Используем порт 3000 для API (фронт на 3001)
    const apiUrl = `${protocol}//${hostname}:3000`;
    console.log('🌐 Auto-detected API URL:', apiUrl, 'from', window.location.href);
    return apiUrl;
  }

  // Для SSR используем переменную окружения или localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  console.log('⚙️ Using SSR API URL:', apiUrl);
  return apiUrl;
}
