"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/lib/hooks";

interface PointAddressHintProps {
  address?: string | null;
  className?: string;
}

export function PointAddressHint({ address, className }: PointAddressHintProps) {
  const { t } = useTranslation();
  const trimmed = address?.trim();
  if (!trimmed) {
    return null;
  }

  return (
    <div className={cn("group/addr relative shrink-0", className)}>
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted/35 transition-colors hover:text-text-muted/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t("pointCard.addressHint")}
      >
        <MapPin className="h-3 w-3" aria-hidden />
      </button>
      <div
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 top-full z-20 mt-1 w-max max-w-[min(16rem,calc(100vw-3rem))] rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs leading-snug text-text-muted opacity-0 shadow-md transition-opacity group-hover/addr:visible group-hover/addr:opacity-100 group-focus-within/addr:visible group-focus-within/addr:opacity-100"
      >
        {trimmed}
      </div>
    </div>
  );
}
