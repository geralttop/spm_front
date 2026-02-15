import { AuthProvider } from 'react-admin';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Функция для получения токена из zustand store
const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) return null;
    
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
};

// Функция для получения данных пользователя
const getUserData = () => {
  if (typeof window === 'undefined') return null;
  
  const token = getAccessToken();
  if (!token) return null;
  
  try {
    // Декодируем JWT токен (простой способ без библиотек)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const authProvider: AuthProvider = {
  login: ({ username, password }) => {
    const request = new Request(`${apiUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    });
    
    return fetch(request)
      .then(response => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(auth => {
        // Сохраняем токен в zustand store через localStorage
        const authStorage = {
          state: {
            accessToken: auth.accessToken || auth.access_token,
            tokenExpiry: Date.now() + 15 * 60 * 1000,
            isAuthenticated: true,
          },
          version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(authStorage));
      })
      .catch(() => {
        throw new Error('Неверные учетные данные');
      });
  },

  logout: () => {
    localStorage.removeItem('auth-storage');
    return Promise.resolve();
  },

  checkError: ({ status }: { status: number }) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth-storage');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = getAccessToken();
    
    if (!token) {
      return Promise.reject();
    }

    const userData = getUserData();
    if (!userData || userData.role !== 'admin') {
      return Promise.reject();
    }

    return Promise.resolve();
  },

  getPermissions: () => {
    const userData = getUserData();
    if (!userData) {
      return Promise.reject();
    }

    return Promise.resolve(userData.role);
  },

  getIdentity: () => {
    const userData = getUserData();
    if (!userData) {
      return Promise.reject();
    }

    return Promise.resolve({
      id: userData.userId || userData.sub,
      fullName: userData.username,
      avatar: undefined,
    });
  },
};