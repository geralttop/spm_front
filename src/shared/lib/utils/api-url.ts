/**
 * Получает URL API на основе переменной окружения
 */
export function getApiUrl(): string {
<<<<<<< HEAD
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  if (typeof window !== 'undefined') {
    console.log('🌐 Using API URL:', apiUrl);
  }
  
=======
  // В браузере определяем автоматически на основе текущего хоста
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Используем порт 3000 для API (фронт на 3001)
    const apiUrl = `${protocol}//${hostname}:3000`;
    return apiUrl;
  }

  // Для SSR используем переменную окружения или localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
>>>>>>> dev
  return apiUrl;
}
