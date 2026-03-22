"use client";

import { MapPin } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { PointPhoto } from "@/shared/api/points";
import { cn } from "@/shared/lib/utils";

type MapPopupPhotosProps = {
  photos: PointPhoto[];
  pointName: string;
  /** Цвет категории для заглушки без фото */
  categoryColor?: string | null;
  className?: string;
};

/**
 * Блок фото в попапе маркера карты: соотношение 4:3, при нескольких снимках — свайп и пагинация.
 */
export function MapPopupPhotos({
  photos,
  pointName,
  categoryColor,
  className,
}: MapPopupPhotosProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div
      className={cn(
        "relative w-full aspect-[4/3] overflow-hidden bg-muted rounded-t-md",
        className
      )}
    >
      {sorted.length > 1 ? (
        <Swiper
          modules={[Pagination, Keyboard]}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          observer
          observeParents
          className="h-full w-full [&_.swiper-pagination-bullet-active]:bg-primary [&_.swiper-pagination-bullet]:bg-border/90 [&_.swiper-pagination]:bottom-2"
        >
          {sorted.map((ph) => (
            <SwiperSlide
              key={ph.id}
              className="!flex h-full items-center justify-center bg-muted/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- URL с API */}
              <img
                src={`${apiBase}${ph.url}`}
                alt={pointName}
                className="h-full w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : sorted.length === 1 ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL с API
        <img
          src={`${apiBase}${sorted[0].url}`}
          alt={pointName}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted"
          style={
            categoryColor
              ? {
                  background: `linear-gradient(135deg, ${categoryColor} 0%, hsl(var(--muted)) 100%)`,
                }
              : undefined
          }
        >
          <MapPin className="size-10 text-white drop-shadow-md" aria-hidden />
        </div>
      )}
    </div>
  );
}
