import {
  MapPin,
  Tag,
  Package,
  User,
  Calendar,
  MessageCircle,
  Map,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, type ComponentType } from "react";
import { userProfilePath } from "@/shared/lib/user-profile-path";
import { useAuthStore } from "@/shared/lib/store";
import type { Point } from "@/shared/api";
import { formatRelativeDate } from "@/shared/lib/utils";
import { Comments } from "@/entities/comment";
import {
  ReportModal,
  EditPointModal,
  FavoriteButton,
  ReportButton,
  EditButton,
  ShareLinkButton,
  PointHistoryTimeline,
} from "@/shared/ui";
import { useTranslation, useProfileQuery } from "@/shared/lib/hooks";
import { useFavoriteStatus } from "@/shared/lib/hooks/use-favorite-status";
import { PointCardMedia } from "@/shared/ui/point-card-media";
import { UserBadges } from "@/shared/ui/user-badges";
import {
  usePointHistoryQuery,
  useCreatePointHistoryMutation,
  useDeletePointHistoryMutation,
} from "@/shared/lib/hooks/queries";

const FavoriteIconButton = FavoriteButton as ComponentType<any>;
const ReportIconButton = ReportButton as ComponentType<any>;
const EditIconButton = EditButton as ComponentType<any>;

interface PointCardProps {
  point: Point;
  showAuthor?: boolean;
  /** Переход с карты шаринга контейнера — для API и ссылок */
  fromContainerId?: string | null;
  onFavoriteChange?: () => void;
  onPointUpdate?: () => void;
}

interface ActionButtonsProps {
  sharePath: string;
  mapHref: string;
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
  sharePath,
  mapHref,
  isAuthor,
  isFavorite,
  loading,
  canReport,
  onEdit,
  onToggleFavorite,
  onReport,
  reportTitle,
}: ActionButtonsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1 sm:gap-2 [&_button]:touch-target [&_button]:min-h-9 [&_button]:min-w-9 sm:[&_button]:min-h-[44px] sm:[&_button]:min-w-[44px] [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_a]:touch-target [&_a]:flex [&_a]:min-h-9 [&_a]:min-w-9 [&_a]:items-center [&_a]:justify-center sm:[&_a]:min-h-[44px] sm:[&_a]:min-w-[44px]">
      <ShareLinkButton path={sharePath} />
      <Link
        href={mapHref}
        prefetch={false}
        className="inline-flex items-center justify-center rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:p-2"
        title={t("map.openOnMap")}
        aria-label={t("map.openOnMap")}
      >
        <Map className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
      </Link>
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

export const PointCard = React.memo(function PointCard({
  point,
  showAuthor = true,
  fromContainerId,
  onFavoriteChange,
  onPointUpdate,
}: PointCardProps) {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: profile } = useProfileQuery();
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { isFavorite, isLoading, toggleFavorite } = useFavoriteStatus(
    point.id,
    onFavoriteChange
  );

  const currentUserId = profile ? Number(profile.userId) : null;
  const canReport =
    accessToken && currentUserId && currentUserId !== point.author.id;
  const isAuthor = currentUserId && currentUserId === point.author.id;

  const sharePath = useMemo(
    () =>
      fromContainerId
        ? `/points/${point.id}?fromContainer=${encodeURIComponent(fromContainerId)}`
        : `/points/${point.id}`,
    [fromContainerId, point.id]
  );
  const mapHref = useMemo(
    () =>
      fromContainerId
        ? `/map?container=${encodeURIComponent(fromContainerId)}&point=${encodeURIComponent(point.id)}`
        : `/map?point=${encodeURIComponent(point.id)}`,
    [fromContainerId, point.id]
  );

  const { data: historyEntries, isLoading: historyLoading, error: historyError } =
    usePointHistoryQuery(point.id, { fromContainer: fromContainerId });
  const createHistoryMutation = useCreatePointHistoryMutation();
  const deleteHistoryMutation = useDeletePointHistoryMutation();
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const handleReportSuccess = () => {
  };

  const handleEditSuccess = () => {
    onPointUpdate?.();
  };

  const handleCreateHistory = async () => {
    try {
      await createHistoryMutation.mutateAsync(point.id);
    } catch {
      // errors handled by mutation + UI error state in timeline (if needed)
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    setDeletePendingId(historyId);
    try {
      await deleteHistoryMutation.mutateAsync({ pointId: point.id, historyId });
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-3 sm:p-6 hover:shadow-md transition-shadow">
      {showAuthor && (
        <div className="mb-3 sm:mb-4 flex items-center gap-2.5 sm:gap-3">
          <Link
            href={userProfilePath(point.author.username)}
            className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 rounded-xl -m-1 p-1 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t("search.viewProfile")}
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-border bg-primary/10">
              {point.author.avatar ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${point.author.avatar}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-main sm:text-base">
                {point.author.firstName} {point.author.lastName}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-muted sm:text-sm">
                <span className="flex min-w-0 items-center gap-1 truncate">
                  @{point.author.username}
                  <UserBadges
                    role={point.author.role}
                    createdPointsCount={point.author.createdPointsCount}
                    className="shrink-0"
                  />
                </span>
                <span
                  className="text-text-muted/40 select-none"
                  aria-hidden
                >
                  ·
                </span>
                <span className="inline-flex shrink-0 items-center gap-1">
                  <Calendar
                    className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                    aria-hidden
                  />
                  <time dateTime={point.createdAt}>
                    {formatRelativeDate(point.createdAt)}
                  </time>
                </span>
              </div>
            </div>
          </Link>
          <div className="-mr-0.5 flex-shrink-0 sm:mr-0">
            <ActionButtons
              sharePath={sharePath}
              mapHref={mapHref}
              isAuthor={!!isAuthor}
              isFavorite={isFavorite}
              loading={isLoading}
              canReport={!!canReport}
              onEdit={() => setShowEditModal(true)}
              onToggleFavorite={toggleFavorite}
              onReport={() => setShowReportModal(true)}
              reportTitle={t("reports.button")}
            />
          </div>
        </div>
      )}

      {!showAuthor && (
        <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-text-muted sm:text-sm">
            <Calendar
              className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
              aria-hidden
            />
            <time dateTime={point.createdAt}>
              {formatRelativeDate(point.createdAt)}
            </time>
          </div>
          <div className="ml-auto flex-shrink-0">
            <ActionButtons
              sharePath={sharePath}
              mapHref={mapHref}
              isAuthor={!!isAuthor}
              isFavorite={isFavorite}
              loading={isLoading}
              canReport={!!canReport}
              onEdit={() => setShowEditModal(true)}
              onToggleFavorite={toggleFavorite}
              onReport={() => setShowReportModal(true)}
              reportTitle={t("reports.button")}
            />
          </div>
        </div>
      )}

      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-lg font-semibold text-text-main mb-1.5 sm:mb-2 break-words">
          {point.name}
        </h3>
        {point.description && (
          <p className="text-xs sm:text-base text-text-main mb-2 sm:mb-3 break-words line-clamp-3 sm:line-clamp-none">
            {point.description}
          </p>
        )}
        {point.address && (
          <div className="flex items-start gap-2 text-xs sm:text-sm text-text-muted mb-2 sm:mb-3">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
            <span className="break-words line-clamp-2 sm:line-clamp-none">
              {point.address}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0" />
            <span className="text-text-muted">{t("profile.category")}:</span>
            <span
              className={`font-medium px-2 py-1 rounded text-xs flex-shrink-0 ${
                point.category?.color
                  ? "text-white"
                  : "bg-muted text-text-main"
              }`}
              style={
                point.category?.color
                  ? { backgroundColor: point.category.color }
                  : undefined
              }
            >
              {point.category?.name || t("profile.noCategory")}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0" />
            <span className="text-text-muted">{t("profile.container")}:</span>
            <span
              className={`font-medium px-2 py-1 rounded text-xs flex-shrink-0 min-w-0 max-w-full truncate ${
                point.container?.color
                  ? "text-white"
                  : "bg-muted text-text-main"
              }`}
              style={
                point.container?.color
                  ? { backgroundColor: point.container.color }
                  : undefined
              }
              title={point.container?.title || t("profile.noContainer")}
            >
              {point.container?.title || t("profile.noContainer")}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted flex-shrink-0 mt-0.5" />
          <span className="text-text-muted">{t("profile.coordinates")}:</span>
          <span className="text-text-main font-mono text-xs break-all">
            {point.coords.coordinates[1].toFixed(6)},{" "}
            {point.coords.coordinates[0].toFixed(6)}
          </span>
        </div>
      </div>

      <PointCardMedia key={point.id} point={point} />

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border space-y-2 sm:space-y-3">
        {isAuthor && (
          <button
            type="button"
            onClick={() => void handleCreateHistory()}
            disabled={createHistoryMutation.isPending}
            className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium touch-target min-h-[44px] -mx-1 px-1 rounded-lg active:bg-primary/10 disabled:opacity-50"
          >
            <span>{t("profile.pointHistory.addEntry")}</span>
          </button>
        )}
        <PointHistoryTimeline
          entries={historyEntries ?? []}
          isLoading={historyLoading}
          error={historyError as Error | null}
          canDelete={!!isAuthor}
          onDelete={handleDeleteHistory}
          deletePendingId={deletePendingId}
        />
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors font-medium touch-target min-h-[44px] -mx-1 px-1 rounded-lg active:bg-primary/10"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span>
            {showComments ? t("comments.hide") : t("comments.show")}
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

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="point"
        targetId={point.id}
        targetName={point.name}
        onSuccess={handleReportSuccess}
      />

      <EditPointModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        point={point}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
});
