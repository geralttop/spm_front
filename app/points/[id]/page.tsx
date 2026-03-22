"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, MapPin } from "lucide-react";
import { PointCard } from "@/shared/ui/point-card";
import { Loading, ErrorMessage } from "@/shared/ui";
import { usePointQuery, useTranslation } from "@/shared/lib/hooks";
import { cn } from "@/shared/lib/utils";

function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export default function PointPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { t } = useTranslation();
  const { data: point, isLoading, error, refetch, isError } = usePointQuery(id);

  useEffect(() => {
    if (point?.name) {
      document.title = `${point.name} · SPM`;
    }
    return () => {
      document.title = "SPM - SharePlacesMaps";
    };
  }, [point?.name]);

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <BackLink />
          <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center text-text-muted">
            <p>{t("pointPage.notFound")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loading message={t("pointPage.loading")} fullScreen />;
  }

  if (isError && error && isNotFoundError(error)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <BackLink />
          <div className="mt-8 flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-12 text-center">
            <MapPin className="h-12 w-12 text-text-muted" aria-hidden />
            <p className="text-text-muted">{t("pointPage.notFound")}</p>
            <Link
              href="/feed"
              className={cn(
                "text-sm font-medium text-primary underline-offset-4 hover:underline"
              )}
            >
              {t("pointPage.backToFeed")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !point) {
    return (
      <ErrorMessage
        message={t("pointPage.loadError")}
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-0 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 px-4 sm:px-0">
          <BackLink />
        </div>
        <div className="-mx-3 sm:mx-0">
          <PointCard
            point={point}
            showAuthor
            onPointUpdate={() => void refetch()}
          />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  const { t } = useTranslation();
  return (
    <Link
      href="/feed"
      className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-main"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {t("pointPage.backToFeed")}
    </Link>
  );
}
