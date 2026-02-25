'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useManageStore } from '@/shared/lib/store';
import { ManagePoints, ManageCategories, ManageContainers } from '@/features/manage';
import { MapPin, Tag, Package } from 'lucide-react';
import { Loading, ErrorMessage } from '@/shared/ui';

export default function ManagePage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { activeTab, setActiveTab, points, categories, containers } = useManageStore();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-main mb-8">Управление данными</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('points')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'points'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <MapPin className="inline h-5 w-5 mr-2" />
            Точки ({points.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'categories'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Tag className="inline h-5 w-5 mr-2" />
            Категории ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('containers')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'containers'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Package className="inline h-5 w-5 mr-2" />
            Контейнеры ({containers.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-lg border border-border p-6">
          {activeTab === 'points' && <ManagePoints />}
          {activeTab === 'categories' && <ManageCategories />}
          {activeTab === 'containers' && <ManageContainers />}
        </div>
      </div>
    </div>
  );
}
