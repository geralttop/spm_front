import { MapPin } from "lucide-react";
import { PointCard } from "./point-card";
import type { Point } from "@/shared/api";

interface PointsSectionProps {
  title: string;
  points: Point[];
  loading: boolean;
  emptyMessage: string;
  loadingMessage: string;
  showAuthor?: boolean;
  onFavoriteChange?: () => void;
}

export function PointsSection({
  title,
  points,
  loading,
  emptyMessage,
  loadingMessage,
  showAuthor = false,
  onFavoriteChange,
}: PointsSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        {title}
      </h2>

      {loading ? (
        <div className="text-center py-8 text-text-muted">
          {loadingMessage}
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-6">
          {points.map((point) => (
            <PointCard 
              key={point.id} 
              point={point} 
              showAuthor={showAuthor}
              onFavoriteChange={onFavoriteChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
