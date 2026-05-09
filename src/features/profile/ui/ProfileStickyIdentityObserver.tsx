"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useProfileStickyTitleStore } from "@/shared/lib/store";
import { cn } from "@/shared/lib/utils";

const ROOT_MARGIN_TOP_PX = -64;

export function ProfileStickyIdentityObserver({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const setIdentityVisible = useProfileStickyTitleStore((s) => s.setIdentityVisible);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIdentityVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `${ROOT_MARGIN_TOP_PX}px 0px 0px 0px`,
        threshold: 0,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setIdentityVisible]);

  return (
    <div ref={rootRef} className={cn(className)}>
      {children}
    </div>
  );
}
