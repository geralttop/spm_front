'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/shared/lib/hooks';
import { useAuthStore } from '@/shared/lib/store';
import { getApiUrl } from '@/shared/lib/utils/api-url';
const AdminApp = dynamic(() => import('@/src/features/admin/AdminApp'), {
    ssr: false,
    loading: () => (<div className="flex items-center justify-center min-h-screen">
      <div className="text-lg" />
    </div>),
});
export default function AdminPage() {
    const { t } = useTranslation();
    const [user, setUser] = useState<{
        role?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const accessToken = useAuthStore((state) => state.accessToken);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const isAuth = await checkAuth();
                if (!isAuth || !accessToken) {
                    router.push('/auth');
                    return;
                }
                const response = await fetch(`${getApiUrl()}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    router.push('/auth');
                    return;
                }
                const userData = await response.json();
                if (userData.role !== 'admin') {
                    alert(t('admin.noAccess'));
                    router.push('/');
                    return;
                }
                setUser(userData);
            }
            catch (error) {
                console.error('Auth check failed:', error);
                router.push('/auth');
            }
            finally {
                setLoading(false);
            }
        };
        checkAdminAccess();
    }, [router, accessToken, checkAuth, t]);
    if (loading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('admin.loading')}</div>
      </div>);
    }
    if (!user) {
        return null;
    }
    return (<div className="min-h-screen">
      <AdminApp />
    </div>);
}
