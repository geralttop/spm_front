'use client';

import { useEffect } from 'react';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PointCard } from '@/src/shared/ui/point-card';
import { Loading, ErrorMessage } from '@/shared/ui';
import { useFeedQuery } from '@/shared/lib/hooks';

export default function FeedPage() {
  const { t } = useTranslation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useFeedQuery(10);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Loading message={t('feed.loading')} fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={t('feed.loadError')}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  const points = data?.pages.flatMap((page) => page.points) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-text-main">{t('feed.title')}</h1>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sm:inline">{t('feed.refresh')}</span>
          </button>
        </div>
        
        {points.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MapPin className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-2 text-lg">{t('feed.empty')}</p>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              {t('feed.emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 -mx-3 sm:mx-0">
            {points.map((point) => (
              <PointCard 
                key={point.id} 
                point={point} 
                showAuthor={true}
                onPointUpdate={() => refetch()}
              />
            ))}

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-text-muted">{t('feed.loading')}</span>
                </div>
              </div>
            )}

            {!hasNextPage && points.length > 0 && (
              <div className="text-center py-6">
                <p className="text-text-muted">{t('feed.allLoaded')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}