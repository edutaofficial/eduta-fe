import { Skeleton } from "@/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <div className="rounded-md bg-white shadow-sm overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/2] w-full">
        <Skeleton className="absolute inset-0" />
        {/* Badge skeleton */}
        <Skeleton className="absolute top-4 right-4 h-6 w-20" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Company */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>

        {/* Rating and Enrollments */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="size-4" />
              ))}
            </div>
            <Skeleton className="h-4 w-8 ml-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>

        {/* Price and Impressions */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-12" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

