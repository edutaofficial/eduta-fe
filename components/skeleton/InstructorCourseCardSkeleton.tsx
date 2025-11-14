import { Skeleton } from "@/components/ui/skeleton";

export function InstructorCourseCardSkeleton() {
  return (
    <div className="relative rounded-md bg-white shadow-sm overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="relative aspect-3/2 w-full" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Subtitle */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Rating and Users */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="size-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>

        {/* Price and Impressions */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>

      {/* Three dot menu skeleton */}
      <div className="absolute top-2 right-2">
        <div className="size-8 rounded-full bg-white shadow-md" />
      </div>
    </div>
  );
}

