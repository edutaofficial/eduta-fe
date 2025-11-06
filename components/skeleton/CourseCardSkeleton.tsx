export function CourseCardSkeleton() {
  return (
    <div className="rounded-md bg-white shadow-sm overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/2] w-full bg-default-200">
        {/* Badge skeleton */}
        <div className="absolute top-4 right-4 h-6 w-20 bg-default-300 rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Company */}
        <div className="space-y-2">
          <div className="h-5 bg-default-200 rounded w-4/5" />
          <div className="h-4 bg-default-200 rounded w-2/5" />
        </div>

        {/* Rating and Enrollments */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="size-4 bg-default-200 rounded" />
              ))}
            </div>
            <div className="h-4 bg-default-200 rounded w-8 ml-1" />
            <div className="h-3 bg-default-200 rounded w-12" />
          </div>
          <div className="flex items-center gap-1">
            <div className="size-4 bg-default-200 rounded" />
            <div className="h-3 bg-default-200 rounded w-8" />
          </div>
        </div>

        {/* Price and Impressions */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-default-200 rounded w-12" />
          <div className="flex items-center gap-1">
            <div className="size-4 bg-default-200 rounded" />
            <div className="h-3 bg-default-200 rounded w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

