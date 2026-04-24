"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { PointPhoto } from "@/shared/api";

export function PointCardPhotosView({ photos, apiBase }: {
  photos: PointPhoto[];
  apiBase: string;
}) {
  return (
    <Swiper
      modules={[Pagination, Keyboard]}
      pagination={{ clickable: true }}
      keyboard={{ enabled: true }}
      className="h-full w-full [&_.swiper-pagination-bullet-active]:bg-primary"
    >
      {photos.map((ph) => (
        <SwiperSlide
          key={ph.id}
          className="!flex h-full items-center justify-center bg-muted/20"
        >
          <div className="relative h-full w-full">
            <Image
              src={`${apiBase}${ph.url}`}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
              unoptimized
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

