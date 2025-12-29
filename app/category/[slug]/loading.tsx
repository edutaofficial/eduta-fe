import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-default-50 mt-20">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>

          <div className="flex items-start gap-6">
            {/* Category Icon Skeleton */}
            <Skeleton className="size-20 bg-white/20 rounded-xl shrink-0" />

            {/* Category Info Skeleton */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-6 w-full max-w-3xl bg-white/20" />
              <Skeleton className="h-6 w-3/4 max-w-2xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Section Skeleton */}
      <div className="bg-white border-b border-default-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-4 border border-default-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Section Skeleton */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-default-200">
              {/* Course Image Skeleton */}
              <div className="relative h-48 bg-default-200 animate-pulse">
                <div className="absolute top-3 right-3">
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>

              {/* Course Content Skeleton */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />

                {/* Instructor */}
                <Skeleton className="h-4 w-32" />

                {/* Rating & Stats */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 pt-2 border-t border-default-100">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* FAQ Section Skeleton */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border border-default-200 rounded-lg p-4"
              >
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

