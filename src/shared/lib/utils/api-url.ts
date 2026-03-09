/**
 * Получает URL API на основе переменной окружения
 */
export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  if (typeof window !== 'undefined') {
    console.log('🌐 Using API URL:', apiUrl);
  }
  
  return apiUrl;
}
