# 🔐 Обновление безопасности фронтенда

## ✅ Что было изменено

### Проблема
Refresh токены хранились в localStorage, что делало их уязвимыми для XSS атак.

### Решение
Refresh токены теперь хранятся в httpOnly cookies на бэкенде, недоступные для JavaScript.

## 📁 Измененные файлы

### 1. `src/shared/lib/store/auth-store.ts`
**Изменения:**
- ❌ Удалено: `refreshToken` из state
- ❌ Удалено: `setTokens()` метод
- ✅ Добавлено: `setAccessToken()` метод
- ✅ Переименовано: `clearTokens()` → `clearAuth()`

**Было:**
```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
}
```

**Стало:**
```typescript
interface AuthState {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}
```

### 2. `src/shared/api/client.ts`
**Изменения:**
- ✅ Добавлено: `withCredentials: true` для отправки cookies
- ✅ Обновлено: Интерцептор refresh токена (токен из cookie)
- ❌ Удалено: Отправка refreshToken в body

**Ключевые изменения:**
```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // ВАЖНО: отправляет cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Refresh без токена в body
const response = await axios.post(
  '/auth/refresh',
  {}, // Пустое body - токен из cookie
  {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### 3. `src/shared/api/auth.ts`
**Изменения:**
- ❌ Удалено: `refreshToken` из `AuthResponse`
- ✅ Добавлено: `logout()` метод
- ❌ Удалено: `refreshToken()` метод (автоматически в интерцепторе)

**Новый метод:**
```typescript
logout: async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/auth/logout");
  return response.data;
}
```

### 4. `app/auth/page.tsx`
**Изменения:**
- ✅ Обновлено: Использует `setAccessToken()` вместо `setTokens()`
- ❌ Удалено: Сохранение refreshToken

**Было:**
```typescript
if (response.accessToken && response.refreshToken) {
  setTokens(response.accessToken, response.refreshToken);
  router.push("/profile");
}
```

**Стало:**
```typescript
if (response.accessToken) {
  setAccessToken(response.accessToken);
  router.push("/profile");
}
```

### 5. `app/profile/page.tsx`
**Изменения:**
- ✅ Добавлено: Вызов `authApi.logout()` перед очисткой state
- ✅ Обновлено: Использует `clearAuth()` вместо `clearTokens()`
- ✅ Добавлено: Loading state для logout

**Новая логика logout:**
```typescript
const handleLogout = async () => {
  setLoggingOut(true);
  try {
    // Очищаем httpOnly cookie на бэкенде
    await authApi.logout();
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Очищаем локальное состояние
    clearAuth();
    router.push("/auth");
  }
};
```

## 🔒 Безопасность

### Что теперь защищено:
- ✅ Refresh token недоступен для JavaScript (httpOnly)
- ✅ XSS атаки не могут украсть refresh token
- ✅ CSRF защита через sameSite: strict
- ✅ Автоматическая очистка cookies при logout

### Как это работает:

1. **Регистрация/Вход:**
   - Пользователь вводит данные
   - Получает код на email
   - Подтверждает код
   - Получает access token в ответе
   - Refresh token автоматически в httpOnly cookie

2. **Обновление токена:**
   - Access token истекает через 15 минут
   - При 401 ошибке автоматически вызывается refresh
   - Refresh token берется из cookie (автоматически)
   - Получаем новый access token
   - Новый refresh token обновляется в cookie

3. **Выход:**
   - Вызывается `/auth/logout`
   - Бэкенд очищает httpOnly cookie
   - Фронтенд очищает access token из памяти
   - Перенаправление на страницу входа

## 🧪 Тестирование

### Проверка cookies в браузере:
1. Откройте DevTools → Application → Cookies
2. После входа должен появиться `refreshToken` cookie
3. Проверьте флаги:
   - ✅ HttpOnly
   - ✅ SameSite: Strict
   - ✅ Secure (в production)

### Проверка автоматического refresh:
1. Войдите в систему
2. Подождите 15 минут (или измените время жизни токена)
3. Сделайте любой запрос к API
4. Токен должен автоматически обновиться
5. Запрос должен выполниться успешно

### Проверка logout:
1. Войдите в систему
2. Нажмите "Выйти"
3. Проверьте, что `refreshToken` cookie удален
4. Попытка доступа к защищенным страницам перенаправляет на /auth

## 📋 Миграция данных

### Очистка старых данных:
При первом запуске обновленного приложения старые refresh токены в localStorage будут игнорироваться. Пользователям нужно будет войти заново.

### Автоматическая миграция:
Можно добавить скрипт для очистки старых данных:

```typescript
// В app/layout.tsx или providers.tsx
useEffect(() => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const auth = JSON.parse(authStorage);
        // Если есть старый refreshToken, очищаем
        if (auth?.state?.refreshToken) {
          localStorage.removeItem('auth-storage');
          console.log('Migrated to new auth system');
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    }
  }
}, []);
```

## ⚠️ Важные замечания

1. **Обратная совместимость:**
   - Бэкенд поддерживает refresh token в body (временно)
   - Можно постепенно мигрировать пользователей

2. **CORS:**
   - `withCredentials: true` требует правильной настройки CORS
   - Бэкенд должен разрешать credentials

3. **HTTPS:**
   - В продакшене cookies работают только по HTTPS
   - Убедитесь, что secure флаг включен

4. **Домены:**
   - Фронт и бэк должны быть на одном домене (или поддомене)
   - Иначе cookies не будут отправляться

## 🚀 Следующие шаги

1. ✅ Обновлен фронтенд для работы с cookies
2. 🔄 Протестировать в development
3. 🔄 Протестировать в production
4. 🔄 Добавить миграционный скрипт (опционально)
5. 🔄 Обновить документацию для пользователей