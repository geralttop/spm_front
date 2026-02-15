'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { Heart, MapPin, Loader2, RefreshCw, Calendar, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PointCard } from '@/src/shared/ui/point-card';
import { favoritesApi, type FavoritePoint } from '@/shared/api';

export default function FavoritesPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoritePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'author'>('date');

  const fetchFavorites = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await favoritesApi.getAll();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAndFetch = async () => {
      if (accessToken) {
        const checkAuth = useAuthStore.getState().checkAuth;
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
          fetchFavorites();
        }
      }
    };

    initializeAndFetch();
  }, [accessToken]);

  const handleFavoriteChange = () => {
    fetchFavorites();
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'author':
        return `${a.author.firstName} ${a.author.lastName}`.localeCompare(
          `${b.author.firstName} ${b.author.lastName}`
        );
      case 'date':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка избранного...</span>
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
            onClick={fetchFavorites}
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-bold text-text-main">Избранное</h1>
            {favorites.length > 0 && (
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            onClick={fetchFavorites}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-main mb-2">
              Ваше избранное пусто
            </h2>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Добавляйте интересные точки в избранное, нажимая на иконку сердца. 
              Они будут отображаться здесь для быстрого доступа.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Исследуйте ленту</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Добавляйте в избранное</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6 p-4 bg-surface border border-border rounded-lg">
              <span className="text-sm font-medium text-text-main">Сортировать по:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('date')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    sortBy === 'date' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-text-muted hover:text-text-main hover:bg-accent'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Дате добавления
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    sortBy === 'name' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-text-muted hover:text-text-main hover:bg-accent'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Названию
                </button>
                <button
                  onClick={() => setSortBy('author')}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    sortBy === 'author' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-text-muted hover:text-text-main hover:bg-accent'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  Автору
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {sortedFavorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <PointCard 
                    point={favorite} 
                    showAuthor={true}
                    onFavoriteChange={handleFavoriteChange}
                  />
                  <div className="absolute top-4 right-4 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                    Добавлено {new Date(favorite.addedAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}