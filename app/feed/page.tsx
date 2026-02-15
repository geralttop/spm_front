'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PointCard } from '@/src/shared/ui/point-card';

interface Point {
  id: string;
  name: string;
  description: string;
  address: string;
  coords: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  } | null;
  container: {
    id: string;
    title: string;
  } | null;
  author: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface FeedResponse {
  points: Point[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function FeedPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { t } = useTranslation();
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/points/feed?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки ленты');
      }

      const data: FeedResponse = await response.json();
      
      if (reset || pageNum === 1) {
        setPoints(data.points);
      } else {
        setPoints(prev => [...prev, ...data.points]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const initializeAndFetch = async () => {
      if (accessToken) {
        // Проверяем аутентификацию перед загрузкой
        const checkAuth = useAuthStore.getState().checkAuth;
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          fetchFeed(1, true);
        }
      }
    };

    initializeAndFetch();
  }, [accessToken, fetchFeed]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchFeed(page + 1);
    }
  }, [fetchFeed, page, loadingMore, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка ленты...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchFeed(1, true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-main">Лента точек</h1>
          <button
            onClick={() => fetchFeed(1, true)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

            {/* Индикатор загрузки */}
            {loadingMore && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-text-muted">Загрузка...</span>
                </div>
              </div>
            )}

            {/* Сообщение об окончании */}
            {!hasMore && points.length > 0 && (
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