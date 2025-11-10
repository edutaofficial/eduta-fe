export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-18">
        <div className="mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="relative z-10 my-4 max-w-container mx-auto">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-default-200 animate-pulse rounded" />
              <div className="h-4 w-4 bg-default-200 animate-pulse rounded" />
              <div className="h-4 w-24 bg-default-200 animate-pulse rounded" />
              <div className="h-4 w-4 bg-default-200 animate-pulse rounded" />
              <div className="h-4 w-32 bg-default-200 animate-pulse rounded" />
            </div>
          </div>

          {/* Logo skeleton */}
          <div className="relative z-10 mb-6 max-w-container mx-auto">
            <div className="h-16 w-48 bg-default-200 animate-pulse rounded" />
          </div>

          {/* Main Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-container mx-auto">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <div className="h-4 w-32 bg-default-200 animate-pulse rounded" />
                <div className="h-12 w-full bg-default-200 animate-pulse rounded" />
                <div className="flex gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-20 bg-default-200 animate-pulse rounded"
                    />
                  ))}
                </div>
              </div>

              {/* Learning Points skeleton */}
              <div className="bg-default-100 rounded-md p-6 space-y-4">
                <div className="h-6 w-48 bg-default-200 animate-pulse rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-default-200 animate-pulse rounded"
                    />
                  ))}
                </div>
              </div>

              {/* Course Outline skeleton */}
              <div className="space-y-4">
                <div className="h-8 w-48 bg-default-200 animate-pulse rounded" />
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-full bg-default-200 animate-pulse rounded"
                  />
                ))}
              </div>

              {/* Description skeleton */}
              <div className="space-y-4">
                <div className="h-8 w-64 bg-default-200 animate-pulse rounded" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-default-200 animate-pulse rounded"
                    />
                  ))}
                </div>
              </div>

              {/* Instructor skeleton */}
              <div className="space-y-4">
                <div className="h-8 w-56 bg-default-200 animate-pulse rounded" />
                <div className="flex gap-6">
                  <div className="size-20 bg-default-200 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-48 bg-default-200 animate-pulse rounded" />
                    <div className="h-4 w-32 bg-default-200 animate-pulse rounded" />
                    <div className="h-4 w-full bg-default-200 animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-default-200 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-default-200 rounded-lg shadow-lg overflow-hidden">
                  {/* Video skeleton */}
                  <div className="aspect-video bg-default-200 animate-pulse" />

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-full bg-default-200 animate-pulse rounded" />
                    <div className="flex gap-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-4 w-20 bg-default-200 animate-pulse rounded"
                        />
                      ))}
                    </div>
                    <div className="h-4 w-32 bg-default-200 animate-pulse rounded" />
                    <div className="h-px w-full bg-default-200" />
                    <div className="space-y-3">
                      <div className="h-12 w-full bg-default-200 animate-pulse rounded" />
                      <div className="h-12 w-full bg-default-200 animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
