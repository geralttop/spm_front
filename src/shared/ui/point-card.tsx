import { MapPin, Tag, Package, User, Calendar, Heart, MessageCircle, Flag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { favoritesApi, authApi } from '@/shared/api';
import { formatRelativeDate } from '@/shared/lib/utils';
import { Comments } from '@/widgets/Comments';
import { ReportModal } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

const favoriteCache = new Map<string, { isFavorite: boolean; count: number; timestamp: number }>();
const CACHE_DURATION = 30000;

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
  onFavoriteChange?: () => void;
}

export function PointCard({ point, showAuthor = true, onFavoriteChange }: PointCardProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkFavoriteStatus = async () => {
      if (!accessToken) return;
      
      const cached = favoriteCache.get(point.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setIsFavorite(cached.isFavorite);
        return;
      }
      
      try {
        const data = await favoritesApi.check(point.id);
        const isFav = data.isFavorite;
        
        setIsFavorite(isFav);
        
        favoriteCache.set(point.id, {
          isFavorite: isFav,
          count: 0,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Ошибка при проверке статуса избранного:', error);
      }
    };

    timeoutId = setTimeout(checkFavoriteStatus, 100);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [point.id, accessToken]);

  // Загружаем информацию о текущем пользователе
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!accessToken) return;
      
      try {
        const profile = await authApi.getProfile();
        setCurrentUserId(Number(profile.userId));
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, [accessToken]);

  const toggleFavorite = async () => {
    if (!accessToken || loading) return;
    
    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(point.id);
      } else {
        await favoritesApi.add(point.id);
      }

      const newIsFavorite = !isFavorite;
      
      setIsFavorite(newIsFavorite);
      
      favoriteCache.set(point.id, {
        isFavorite: newIsFavorite,
        count: 0,
        timestamp: Date.now()
      });
      
      onFavoriteChange?.();
    } catch (error) {
      console.error('Ошибка при изменении избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSuccess = () => {
    // Можно показать уведомление об успешной отправке жалобы
    console.log('Жалоба успешно отправлена');
  };

  // Проверяем, может ли пользователь пожаловаться на эту точку
  const canReport = accessToken && currentUserId && currentUserId !== point.author.id;

  // Отладочная информация (можно удалить в продакшене)
  useEffect(() => {
    console.log('PointCard debug:', {
      accessToken: !!accessToken,
      currentUserId,
      pointAuthorId: point.author.id,
      canReport
    });
  }, [accessToken, currentUserId, point.author.id, canReport]);

  return (
    <div className="bg-surface border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
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
              {formatRelativeDate(point.createdAt)}
            </div>
            <div className="flex items-center gap-2">
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
              {canReport && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                  title={t('reports.button')}
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!showAuthor && (
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Calendar className="h-4 w-4" />
            {formatRelativeDate(point.createdAt)}
          </div>
          <div className="flex items-center gap-2">
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
            {canReport && (
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                title={t('reports.button')}
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

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

      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{showComments ? t('comments.hide') : t('comments.show')}</span>
        </button>
        
        {showComments && (
          <div className="mt-4">
            <Comments pointId={point.id} />
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="point"
        targetId={point.id}
        targetName={point.name}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}