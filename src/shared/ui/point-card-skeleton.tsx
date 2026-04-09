import { POINT_MEDIA_ASPECT_CSS } from "@/shared/lib/point-media-aspect";
import { cn } from "@/shared/lib/utils";
function ShimmerBlock({ className }: {
    className?: string;
}) {
    return (<div className={cn("animate-pulse rounded-md bg-muted dark:bg-muted/80", className)}/>);
}
export function PointCardSkeleton({ className }: {
    className?: string;
}) {
    return (<div className={cn("rounded-xl border border-border bg-surface p-3 sm:p-6", className)} aria-hidden>
      <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
        <ShimmerBlock className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10"/>
        <div className="min-w-0 flex-1 space-y-2">
          <ShimmerBlock className="h-4 w-40 max-w-[70%]"/>
          <ShimmerBlock className="h-3 w-28 max-w-[50%]"/>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <ShimmerBlock className="size-9 rounded-lg sm:size-11"/>
          <ShimmerBlock className="size-9 rounded-lg sm:size-11"/>
        </div>
      </div>

      <div className="mb-3 space-y-2 sm:mb-4">
        <ShimmerBlock className="h-5 w-full max-w-md"/>
        <ShimmerBlock className="h-3 w-full max-w-lg"/>
        <ShimmerBlock className="h-3 w-full max-w-sm"/>
      </div>

      <div className="mb-3 space-y-2 sm:mb-4">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <ShimmerBlock className="h-6 w-32"/>
          <ShimmerBlock className="h-6 w-36"/>
        </div>
        <ShimmerBlock className="h-3 w-48 max-w-full"/>
      </div>

      <div className="-mx-3 overflow-hidden rounded-none border border-border bg-muted/20 sm:mx-0 sm:rounded-lg">
        <div className="w-full bg-muted/40 dark:bg-muted/30" style={{ aspectRatio: POINT_MEDIA_ASPECT_CSS }}/>
      </div>

      <div className="mt-3 border-t border-border pt-3 sm:mt-4 sm:pt-4">
        <ShimmerBlock className="h-10 w-40 rounded-lg"/>
      </div>
    </div>);
}
const DEFAULT_COUNT = 3;
type PointCardSkeletonListProps = {
    count?: number;
    ariaLabel: string;
    className?: string;
};
export function PointCardSkeletonList({ count = DEFAULT_COUNT, ariaLabel, className, }: PointCardSkeletonListProps) {
    return (<div role="status" aria-busy="true" aria-label={ariaLabel} className={cn("-mx-3 space-y-4 sm:mx-0 sm:space-y-6", className)}>
      {Array.from({ length: count }, (_, i) => (<PointCardSkeleton key={i}/>))}
    </div>);
}
