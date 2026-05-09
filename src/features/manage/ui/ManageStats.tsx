"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { statsApi, type MyStatsResponse } from "@/shared/api";
import { Loading } from "@/shared/ui";
import { MapPin, MessageSquare, Heart, Tag, Package } from "lucide-react";
import { ManageVerification } from "./ManageVerification";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
};

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-border bg-muted/40 p-2">
          <Icon className="h-5 w-5 text-text-main" />
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm text-text-muted">{title}</div>
          <div className="text-xl sm:text-2xl font-semibold text-text-main tabular-nums">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManageStats() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MyStatsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await statsApi.getMyStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  const safe = stats ?? {
    pointsCreated: 0,
    commentsCreated: 0,
    favoritesCount: 0,
    categoriesCreated: 0,
    containersCreated: 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg sm:text-xl font-semibold text-text-main">
          {t("manage.stats")}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">{t("manage.statsHint")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          title={t("manage.statsCards.pointsCreated")}
          value={safe.pointsCreated}
          icon={MapPin}
        />
        <StatCard
          title={t("manage.statsCards.commentsCreated")}
          value={safe.commentsCreated}
          icon={MessageSquare}
        />
        <StatCard
          title={t("manage.statsCards.favoritesCount")}
          value={safe.favoritesCount}
          icon={Heart}
        />
        <StatCard
          title={t("manage.statsCards.categoriesCreated")}
          value={safe.categoriesCreated}
          icon={Tag}
        />
        <StatCard
          title={t("manage.statsCards.containersCreated")}
          value={safe.containersCreated}
          icon={Package}
        />
      </div>

      <ManageVerification />
    </div>
  );
}

