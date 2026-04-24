"use client";

import Link from "next/link";
import { Map } from "lucide-react";
import { useTranslation } from "@/shared/lib/hooks";
import { FavoriteButton, ReportButton, EditButton, ShareLinkButton } from "@/shared/ui";

export function PointCardActionButtons({
  sharePath,
  mapHref,
  showMapLink,
  isAuthor,
  isFavorite,
  loading,
  canReport,
  onEdit,
  onToggleFavorite,
  onReport,
  reportTitle,
  editTitle,
}: {
  sharePath: string;
  mapHref: string;
  showMapLink: boolean;
  isAuthor: boolean;
  isFavorite: boolean;
  loading: boolean;
  canReport: boolean;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onReport: () => void;
  reportTitle: string;
  editTitle: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 sm:gap-2 [&_button]:touch-target [&_button]:min-h-9 [&_button]:min-w-9 sm:[&_button]:min-h-[44px] sm:[&_button]:min-w-[44px] [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_a]:touch-target [&_a]:flex [&_a]:min-h-9 [&_a]:min-w-9 [&_a]:items-center [&_a]:justify-center sm:[&_a]:min-h-[44px] sm:[&_a]:min-w-[44px]">
      <ShareLinkButton path={sharePath} />
      {showMapLink ? (
        <Link
          href={mapHref}
          prefetch={false}
          className="inline-flex items-center justify-center rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:p-2"
          title={t("map.openOnMap")}
          aria-label={t("map.openOnMap")}
        >
          <Map className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
        </Link>
      ) : null}
      {isAuthor && <EditButton onClick={onEdit} title={editTitle} />}
      <FavoriteButton
        isFavorite={isFavorite}
        loading={loading}
        onClick={onToggleFavorite}
      />
      {canReport && <ReportButton onClick={onReport} title={reportTitle} />}
    </div>
  );
}

