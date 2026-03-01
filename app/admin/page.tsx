'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/lib/store';
import AdminApp from '@/src/features/admin/AdminApp';

export default function AdminPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Проверяем авторизацию и роль пользователя
    const checkAdminAccess = async () => {
      try {
        // Сначала проверяем, авторизован ли пользователь
        const isAuth = await checkAuth();
        
        if (!isAuth || !accessToken) {
          router.push('/auth');
          return;
        }

        // Получаем информацию о пользователе
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          router.push('/auth');
          return;
        }

        const userData = await response.json();
        
        // Проверяем роль admin
        if (userData.role !== 'admin') {
          alert('У вас нет прав доступа к админке');
          router.push('/');
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router, accessToken, checkAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <AdminApp />
    </div>
  );
}