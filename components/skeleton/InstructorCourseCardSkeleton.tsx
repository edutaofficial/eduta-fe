export function InstructorCourseCardSkeleton() {
  return (
    <div className="relative rounded-md bg-white shadow-sm overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-3/2 w-full bg-default-200" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Subtitle */}
        <div className="space-y-2">
          <div className="h-5 bg-default-200 rounded w-3/4" />
          <div className="h-4 bg-default-200 rounded w-full" />
        </div>

        {/* Rating and Users */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="size-4 bg-default-200 rounded" />
              ))}
            </div>
            <div className="h-4 bg-default-200 rounded w-8" />
            <div className="h-4 bg-default-200 rounded w-12" />
          </div>
          <div className="flex items-center gap-1">
            <div className="size-4 bg-default-200 rounded" />
            <div className="h-4 bg-default-200 rounded w-8" />
          </div>
        </div>

        {/* Price and Impressions */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-default-200 rounded w-16" />
          <div className="flex items-center gap-1">
            <div className="size-4 bg-default-200 rounded" />
            <div className="h-4 bg-default-200 rounded w-8" />
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

