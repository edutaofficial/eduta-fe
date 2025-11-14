import { Skeleton } from "@/components/ui/skeleton";

export function DraftCourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6 space-y-4">
      {/* Course Icon and Title */}
      <div className="flex items-start gap-4">
        <Skeleton className="size-14 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-10" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 rounded-full w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Action Button */}
      <Skeleton className="h-10 rounded-lg w-full" />
    </div>
  );
}
