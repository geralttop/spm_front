import { MapPin, Tag, Package, User, Calendar, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/shared/lib/store';

// Простой кэш для избранного
const favoriteCache = new Map<string, { isFavorite: boolean; count: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 секунд

interface Point {
  id: string;
  name: string;
  description?: string;
  address?: string;
  coords: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  category?: {
    id: number;
    name: string;
    color: string;
    icon?: string;
  } | null;
  container?: {
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

interface PointCardProps {
  point: Point;
  showAuthor?: boolean;
  onFavoriteChange?: () => void; // Колбэк для обновления списка после изменения избранного
}

export function PointCard({ point, showAuthor = true, onFavoriteChange }: PointCardProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Проверяем, находится ли точка в избранном (с кэшированием и дебаунсингом)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkFavoriteStatus = async () => {
      if (!accessToken) return;
      
      // Проверяем кэш (только для статуса избранного)
      const cached = favoriteCache.get(point.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setIsFavorite(cached.isFavorite);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/favorites/check/${point.id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          const isFav = data.isFavorite;
          
          setIsFavorite(isFav);
          
          // Сохраняем в кэш (без счетчика)
          favoriteCache.set(point.id, {
            isFavorite: isFav,
            count: 0, // Не используется
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса избранного:', error);
      }
    };

    // Дебаунсинг для уменьшения количества запросов
    timeoutId = setTimeout(checkFavoriteStatus, 100);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [point.id, accessToken]);

  const toggleFavorite = async () => {
    if (!accessToken || loading) return;
    
    setLoading(true);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/favorites/${point.id}`, {
        method,
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const newIsFavorite = !isFavorite;
        
        setIsFavorite(newIsFavorite);
        
        // Обновляем кэш (без счетчика)
        favoriteCache.set(point.id, {
          isFavorite: newIsFavorite,
          count: 0, // Не используется
          timestamp: Date.now()
        });
        
        onFavoriteChange?.(); // Вызываем колбэк для обновления родительского компонента
      }
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${diffInHours} ч. назад`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Заголовок с автором */}
      {showAuthor && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-text-main">
              {point.author.firstName} {point.author.lastName}
            </p>
            <p className="text-sm text-text-muted">@{point.author.username}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <Calendar className="h-4 w-4" />
              {formatDate(point.createdAt)}
            </div>
            {/* Кнопка избранного */}
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} 
              />
            </button>
          </div>
        </div>
      )}

      {/* Если автор не показывается, добавляем кнопку избранного отдельно */}
      {!showAuthor && (
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Calendar className="h-4 w-4" />
            {formatDate(point.createdAt)}
          </div>
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50`}
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} 
            />
          </button>
        </div>
      )}

      {/* Основная информация о точке */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-main mb-2">{point.name}</h3>
        {point.description && (
          <p className="text-text-main mb-3">{point.description}</p>
        )}
        {point.address && (
          <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
            <MapPin className="h-4 w-4" />
            {point.address}
          </div>
        )}
      </div>

      {/* Метаданные */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted">Категория:</span>
          <span 
            className="font-medium px-2 py-1 rounded text-white text-xs"
            style={{ backgroundColor: point.category?.color || '#6B7280' }}
          >
            {point.category?.name || 'Без категории'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted">Контейнер:</span>
          <span className="text-text-main font-medium">
            {point.container?.title || 'Без контейнера'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-text-muted" />
          <span className="text-text-muted">Координаты:</span>
          <span className="text-text-main font-mono text-xs">
            {point.coords.coordinates[1].toFixed(6)}, {point.coords.coordinates[0].toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
}