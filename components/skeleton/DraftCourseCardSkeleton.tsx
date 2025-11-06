export function DraftCourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-default-200 p-6 space-y-4 animate-pulse">
      {/* Course Icon and Title */}
      <div className="flex items-start gap-4">
        <div className="size-14 rounded-xl bg-default-200 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-default-200 rounded w-3/4" />
          <div className="h-4 bg-default-200 rounded w-full" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-default-200 rounded w-16" />
          <div className="h-5 bg-default-200 rounded w-10" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-default-200 rounded-full w-full" />
          <div className="h-3 bg-default-200 rounded w-32" />
        </div>
      </div>

      {/* Action Button */}
      <div className="h-10 bg-default-200 rounded-lg w-full" />
    </div>
  );
}

