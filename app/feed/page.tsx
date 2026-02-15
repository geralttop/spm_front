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
    return <Loading message="Загрузка ленты..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Ошибка загрузки ленты"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  const points = data?.pages.flatMap((page) => page.points) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-main">Лента точек</h1>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
        
        {points.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-2">Ваша лента пуста</p>
            <p className="text-sm text-text-muted">
              Подпишитесь на других пользователей или создайте свои точки, чтобы увидеть их здесь
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {points.map((point) => (
              <PointCard key={point.id} point={point} showAuthor={true} />
            ))}

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-text-muted">Загрузка...</span>
                </div>
              </div>
            )}

            {!hasNextPage && points.length > 0 && (
              <div className="text-center py-6">
                <p className="text-text-muted">Все точки загружены</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}