import { MapPin, Tag, Package, User, Calendar, MessageCircle } from 'lucide-react';
import { useState, useEffect, type ComponentType } from 'react';
import { useAuthStore } from '@/shared/lib/store';
import { useSettingsStore } from '@/shared/lib/store/settings-store';
import { favoritesApi, type Point } from '@/shared/api';
import { formatRelativeDate } from '@/shared/lib/utils';
import { Comments } from '@/entities/comment';
import { ReportModal, EditPointModal, FavoriteButton, ReportButton, EditButton } from '@/shared/ui';
import { useTranslation, useProfileQuery, useMapSettingsQuery } from '@/shared/lib/hooks';
import { Map as MapComponent, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/shared/ui/map";
import { MAP_STYLES, type MapStyleKey } from "@/shared/config/map-styles";

const favoriteCache = new Map<string, { isFavorite: boolean; count: number; timestamp: number }>();
const CACHE_DURATION = 30000;

const FavoriteIconButton = FavoriteButton as ComponentType<any>;
const ReportIconButton = ReportButton as ComponentType<any>;
const EditIconButton = EditButton as ComponentType<any>;

interface PointCardProps {
  point: Point;
  showAuthor?: boolean;
  onFavoriteChange?: () => void;
  onPointUpdate?: () => void;
}

interface ActionButtonsProps {
  isAuthor: boolean;
  isFavorite: boolean;
  loading: boolean;
  canReport: boolean;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onReport: () => void;
  reportTitle: string;
}

function ActionButtons({
  isAuthor,
  isFavorite,
  loading,
  canReport,
  onEdit,
  onToggleFavorite,
  onReport,
  reportTitle,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {isAuthor && (
        <EditIconButton onClick={onEdit} title="Редактировать точку" />
      )}
      <FavoriteIconButton
        isFavorite={isFavorite}
        loading={loading}
        onClick={onToggleFavorite}
      />
      {canReport && (
        <ReportIconButton onClick={onReport} title={reportTitle} />
      )}
    </div>
  );
}

export function PointCard({ point, showAuthor = true, onFavoriteChange, onPointUpdate }: PointCardProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { availableMapStyles, defaultMapStyle, loadSettings } = useSettingsStore();
  const { data: profile } = useProfileQuery();
  const { data: mapSettings } = useMapSettingsQuery();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>(defaultMapStyle);

  const currentUserId = profile ? Number(profile.userId) : null;

  // Загружаем настройки при монтировании
  useEffect(() => {
    if (accessToken && mapSettings) {
      loadSettings(mapSettings);
    }
  }, [accessToken, mapSettings, loadSettings]);

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
  
  // Проверяем, является ли текущий пользователь автором точки
  const isAuthor = currentUserId && currentUserId === point.author.id;

  const handleEditSuccess = () => {
    onPointUpdate?.();
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      {showAuthor && (
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border-2 border-border">
            {point.author.avatar ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}${point.author.avatar}`}
                alt={point.author.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-main text-sm sm:text-base truncate">
              {point.author.firstName} {point.author.lastName}
            </p>
            <p className="text-xs sm:text-sm text-text-muted truncate">@{point.author.username}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-text-muted">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatRelativeDate(point.createdAt)}</span>
            </div>
            <ActionButtons
              isAuthor={!!isAuthor}
              isFavorite={isFavorite}
              loading={loading}
              canReport={!!canReport}
              onEdit={() => setShowEditModal(true)}
              onToggleFavorite={toggleFavorite}
              onReport={() => setShowReportModal(true)}
              reportTitle={t('reports.button')}
            />
          </div>
        </div>
      )}

      {!showAuthor && (
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-text-muted">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{formatRelativeDate(point.createdAt)}</span>
          </div>
          <ActionButtons
            isAuthor={!!isAuthor}
            isFavorite={isFavorite}
            loading={loading}
            canReport={!!canReport}
            onEdit={() => setShowEditModal(true)}
            onToggleFavorite={toggleFavorite}
            onReport={() => setShowReportModal(true)}
            reportTitle={t('reports.button')}
          />
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-text-main mb-2 break-words">{point.name}</h3>
        {point.description && (
          <p className="text-sm sm:text-base text-text-main mb-3 break-words">{point.description}</p>
        )}
        {point.address && (
          <div className="flex items-start gap-2 text-xs sm:text-sm text-text-muted mb-3">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
            <span className="break-words">{point.address}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0" />
          <span className="text-text-muted">
            {t('profile.category')}:
          </span>
            <span 
              className="font-medium px-2 py-1 rounded text-white text-xs flex-shrink-0"
              style={{ backgroundColor: point.category?.color || '#6B7280' }}
            >
              {point.category?.name || t('profile.noCategory')}
            </span>
          </div>

        <div className="flex items-center gap-2">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0" />
          <span className="text-text-muted">
            {t('profile.container')}:
          </span>
            <span className="text-text-main font-medium truncate">
              {point.container?.title || t('profile.noContainer')}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0 mt-0.5" />
          <span className="text-text-muted">
            {t('profile.coordinates')}:
          </span>
          <span className="text-text-main font-mono text-xs break-all">
            {point.coords.coordinates[1].toFixed(6)}, {point.coords.coordinates[0].toFixed(6)}
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="h-[400px] w-full">
          <MapComponent 
            center={[point.coords.coordinates[0], point.coords.coordinates[1]]} 
            zoom={15}
            styles={{
              light: MAP_STYLES[mapStyle].light,
              dark: MAP_STYLES[mapStyle].dark,
            }}
          >
            <MapMarker
              longitude={point.coords.coordinates[0]}
              latitude={point.coords.coordinates[1]}
            >
              <MarkerContent>
                <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
              </MarkerContent>
              <MarkerTooltip>{point.name}</MarkerTooltip>
              <MarkerPopup>
                <div className="space-y-1">
                  <p className="font-medium text-text-main">{point.name}</p>
                  {point.description && (
                    <p className="text-sm text-text-muted">{point.description}</p>
                  )}
                  <p className="text-xs text-text-muted">
                    {point.coords.coordinates[1].toFixed(4)}, {point.coords.coordinates[0].toFixed(4)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
            <MapControls
              position="bottom-right"
              showZoom
              showCompass
              showLocate
              showFullscreen
            />
          </MapComponent>
        </div>
        <div className="absolute top-2 right-2 z-10">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}
            className="bg-surface text-text-main border border-border rounded-md px-2 py-1 text-sm shadow max-w-[200px]"
          >
            {availableMapStyles.map((key) => (
              <option key={key} value={key}>
                {t(`mapStyles.${key}.name`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>
            {showComments ? t('comments.hide') : t('comments.show')}
          </span>
          {point.commentsCount !== undefined && point.commentsCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              {point.commentsCount}
            </span>
          )}
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

      {/* Edit Point Modal */}
      <EditPointModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        point={point}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}