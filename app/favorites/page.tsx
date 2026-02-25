'use client';

import { useState } from 'react';
import { Heart, MapPin, RefreshCw, Calendar, User as UserIcon } from 'lucide-react';
import { PointCard } from '@/src/shared/ui/point-card';
import { Loading, ErrorMessage } from '@/shared/ui';
import { useFavoritesQuery } from '@/shared/lib/hooks';

export default function FavoritesPage() {
  const { data: favorites = [], isLoading, error, refetch } = useFavoritesQuery();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'author'>('date');

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

  if (isLoading) {
    return <Loading message="Загрузка избранного..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Ошибка загрузки избранного"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">Избранное</h1>
            {favorites.length > 0 && (
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 w-full sm:w-auto touch-target"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sm:inline">Обновить</span>
          </button>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-text-main mb-2">
              Ваше избранное пусто
            </h2>
            <p className="text-sm sm:text-base text-text-muted mb-6 max-w-md mx-auto">
              Добавляйте интересные точки в избранное, нажимая на иконку сердца. 
              Они будут отображаться здесь для быстрого доступа.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-muted">
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
            {/* Sorting Controls */}
            <div className="p-4 bg-surface border border-border rounded-lg mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-medium text-text-main">Сортировать по:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setSortBy('date')}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors touch-target ${
                      sortBy === 'date' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background text-text-muted hover:text-text-main hover:bg-accent'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Дате добавления</span>
                    <span className="sm:hidden">Дате</span>
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors touch-target ${
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
                    className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors touch-target ${
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
            </div>

            {/* Favorites List */}
            <div className="space-y-4 sm:space-y-6">
              {sortedFavorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <PointCard 
                    point={favorite} 
                    showAuthor={true}
                    onFavoriteChange={() => refetch()}
                    onPointUpdate={() => refetch()}
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                    <span className="hidden sm:inline">
                      Добавлено {new Date(favorite.addedAt).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="sm:hidden">
                      {new Date(favorite.addedAt).toLocaleDateString('ru-RU', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </span>
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
