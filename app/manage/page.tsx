'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { categoriesApi, containersApi } from '@/shared/api';
import { filterManageCategoryList, filterManageContainerList } from '@/features/manage/lib/system-default-entities';
import { useAuthStore, useManageStore } from '@/shared/lib/store';
import { ManagePoints, ManageCategories, ManageContainers } from '@/features/manage';
import { MapPin, Tag, Package } from 'lucide-react';
import { Loading } from '@/shared/ui';
export default function ManagePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const accessToken = useAuthStore((state) => state.accessToken);
    const { activeTab, setActiveTab, points, categories, containers, setCategories, setContainers } = useManageStore();
    useEffect(() => {
        if (!accessToken) {
            router.push('/auth');
        }
    }, [accessToken, router]);
    useEffect(() => {
        if (!accessToken)
            return;
        let cancelled = false;
        const loadCountsForTabs = async () => {
            try {
                const [cats, conts] = await Promise.all([categoriesApi.getAll(), containersApi.getAll()]);
                if (!cancelled) {
                    setCategories(cats);
                    setContainers(conts);
                }
            }
            catch (err) {
                console.error('Error loading manage tab counts:', err);
            }
        };
        void loadCountsForTabs();
        return () => {
            cancelled = true;
        };
    }, [accessToken, setCategories, setContainers]);
    if (!accessToken) {
        return <Loading />;
    }
    return (<div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-1 sm:px-4 py-4 sm:py-8 lg:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main mb-4 sm:mb-8">{t('manage.title')}</h1>

        
        <div className="flex overflow-x-auto gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-border -mx-1 px-1 sm:-mx-0 sm:px-0 scrollbar-hide">
          <button onClick={() => setActiveTab('points')} className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors shrink-0 ${activeTab === 'points'
            ? 'text-primary border-b-2 border-primary'
            : 'text-text-muted hover:text-text-main'}`}>
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5"/>
            <span className="hidden xs:inline">{t('sidebar.map')}</span> ({points.length})
          </button>
          <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors shrink-0 ${activeTab === 'categories'
            ? 'text-primary border-b-2 border-primary'
            : 'text-text-muted hover:text-text-main'}`}>
            <Tag className="h-4 w-4 sm:h-5 sm:w-5"/>
            <span className="hidden xs:inline">{t('manage.categories')}</span> ({filterManageCategoryList(categories).length})
          </button>
          <button onClick={() => setActiveTab('containers')} className={`flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors shrink-0 ${activeTab === 'containers'
            ? 'text-primary border-b-2 border-primary'
            : 'text-text-muted hover:text-text-main'}`}>
            <Package className="h-4 w-4 sm:h-5 sm:w-5"/>
            <span className="hidden xs:inline">{t('manage.containers')}</span> ({filterManageContainerList(containers).length})
          </button>
        </div>

        
        <div className="bg-card rounded-lg border border-border p-2 sm:p-6">
          {activeTab === 'points' && <ManagePoints />}
          {activeTab === 'categories' && <ManageCategories />}
          {activeTab === 'containers' && <ManageContainers />}
        </div>
      </div>
    </div>);
}
