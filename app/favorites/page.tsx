'use client';

import { useState } from 'react';
import { Heart, MapPin, RefreshCw, Calendar, User as UserIcon } from 'lucide-react';
import { PointCard } from '@/src/shared/ui/point-card';
import { ErrorMessage, PointCardSkeletonList } from '@/shared/ui';
import { useFavoritesQuery, useTranslation } from '@/shared/lib/hooks';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { data: favorites = [], isLoading, error, refetch } = useFavoritesQuery();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'author'>('date');

  const parseDate = (value: string | undefined): number =>
    value ? new Date(value).getTime() : 0;
  const formatAddedDate = (value: string | undefined): string => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ru-RU');
  };
  const formatAddedDateShort = (value: string | undefined): string => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
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
        return parseDate(b.addedAt) - parseDate(a.addedAt);
    }
  });

  if (error) {
    return (
      <ErrorMessage
        message={t('favorites.loadError')}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-0 py-4 sm:px-6 sm:py-6 lg:px-8">
        {isLoading ? (
          <>
            <div className="mb-6 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0">
              <div className="flex min-w-0 items-center gap-3">
                <Heart className="h-5 w-5 shrink-0 text-destructive sm:h-6 sm:w-6" />
                <h1 className="truncate text-xl font-bold text-text-main sm:text-2xl">{t('favorites.title')}</h1>
              </div>
              <button
                type="button"
                disabled
                className="flex w-full touch-target items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm opacity-60 min-h-[44px] sm:min-h-0 sm:w-auto sm:py-2"
              >
                <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                <span>{t('favorites.refresh')}</span>
              </button>
            </div>
            <PointCardSkeletonList ariaLabel={t('feed.loading')} className="px-2 sm:px-0" />
          </>
        ) : (
          <>
        <div className="mb-6 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0">
          <div className="flex min-w-0 items-center gap-3">
            <Heart className="h-5 w-5 shrink-0 text-destructive sm:h-6 sm:w-6" />
            <h1 className="truncate text-xl font-bold text-text-main sm:text-2xl">{t('favorites.title')}</h1>
            {favorites.length > 0 && (
              <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive sm:text-sm">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex w-full touch-target items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm transition-colors hover:bg-accent disabled:opacity-50 min-h-[44px] sm:min-h-0 sm:w-auto sm:py-2"
          >
            <RefreshCw className={`h-4 w-4 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('favorites.refresh')}</span>
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="px-2 py-12 text-center sm:py-16">
            <Heart className="mx-auto mb-4 h-12 w-12 text-text-muted sm:h-16 sm:w-16" />
            <h2 className="mb-2 text-lg font-semibold text-text-main sm:text-xl">{t('favorites.empty')}</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-text-muted sm:text-base">{t('favorites.emptyDescription')}</p>
            <div className="flex flex-col items-center justify-center gap-4 text-sm text-text-muted sm:flex-row">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{t('favorites.exploreFeed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 shrink-0" />
                <span>{t('favorites.addToFavoritesAction')}</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 px-2 sm:mb-6 sm:px-0">
              <div className="rounded-lg border border-border bg-surface p-2.5 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <span className="shrink-0 text-sm font-medium text-text-main">{t('favorites.sortBy')}</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                    <button
                      type="button"
                      onClick={() => setSortBy('date')}
                      className={`flex shrink-0 touch-target items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px] sm:min-h-0 sm:justify-start sm:py-2 ${
                        sortBy === 'date'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-text-muted hover:bg-accent hover:text-text-main'
                      }`}
                    >
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{t('favorites.sortByDate')}</span>
                      <span className="sm:hidden">{t('favorites.sortByDateShort')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('name')}
                      className={`flex shrink-0 touch-target items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px] sm:min-h-0 sm:justify-start sm:py-2 ${
                        sortBy === 'name'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-text-muted hover:bg-accent hover:text-text-main'
                      }`}
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      {t('favorites.sortByName')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy('author')}
                      className={`flex shrink-0 touch-target items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px] sm:min-h-0 sm:justify-start sm:py-2 ${
                        sortBy === 'author'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-text-muted hover:bg-accent hover:text-text-main'
                      }`}
                    >
                      <UserIcon className="h-4 w-4 shrink-0" />
                      {t('favorites.sortByAuthor')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="-mx-3 space-y-4 sm:mx-0 sm:space-y-6">
              {sortedFavorites.map((favorite) => (
                <div key={favorite.id} className="space-y-1">
                  <PointCard
                    point={favorite}
                    showAuthor={true}
                    onFavoriteChange={() => refetch()}
                    onPointUpdate={() => refetch()}
                  />
                  <p className="px-3 text-xs text-text-muted sm:px-0 sm:text-sm">
                    <span className="hidden sm:inline">
                      {t('favorites.addedAt')} {formatAddedDate(favorite.addedAt)}
                    </span>
                    <span className="sm:hidden">
                      {t('favorites.addedAt')} {formatAddedDateShort(favorite.addedAt)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
}
