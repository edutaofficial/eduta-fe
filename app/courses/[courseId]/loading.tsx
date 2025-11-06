export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top margin for fixed header */}
      <div className="pt-18">
        <div className="mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="my-4 max-w-container mx-auto">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-4 bg-default-200 rounded w-16" />
              <div className="h-4 w-4 bg-default-200 rounded" />
              <div className="h-4 bg-default-200 rounded w-32" />
              <div className="h-4 w-4 bg-default-200 rounded" />
              <div className="h-4 bg-default-200 rounded w-24" />
            </div>
          </div>

          {/* Border skeleton */}
          <div className="h-px bg-default-200 mb-6 max-w-container mx-auto" />

          {/* Logo skeleton */}
          <div className="mb-6 max-w-container mx-auto">
            <div className="h-16 bg-default-200 rounded w-[13.75rem] animate-pulse" />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-container mx-auto">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category and Title Section */}
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-default-200 rounded w-40" />
                <div className="h-12 bg-default-200 rounded w-full" />
                <div className="h-12 bg-default-200 rounded w-full max-w-md" />
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-5 bg-default-200 rounded w-16" />
                  <div className="h-4 w-4 bg-default-200 rounded-full" />
                  <div className="h-5 bg-default-200 rounded w-24" />
                  <div className="h-4 w-4 bg-default-200 rounded-full" />
                  <div className="h-5 bg-default-200 rounded w-20" />
                  <div className="h-4 w-4 bg-default-200 rounded-full" />
                  <div className="h-5 bg-default-200 rounded w-20" />
                </div>
              </div>

              {/* Learning Points skeleton */}
              <div className="bg-default-100 rounded-md p-6 space-y-4 animate-pulse">
                <div className="h-7 bg-default-200 rounded w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-5 w-5 bg-default-200 rounded-full shrink-0 mt-0.5" />
                      <div className="h-5 bg-default-200 rounded flex-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Outline skeleton */}
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-default-200 rounded w-48" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-default-300 rounded-md p-6"
                    >
                      <div className="h-6 bg-default-200 rounded w-64 mb-4" />
                      <div className="space-y-3 pt-2">
                        {[...Array(3)].map((_, j) => (
                          <div
                            key={j}
                            className="flex items-center justify-between py-2 px-3"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-5 w-5 bg-default-200 rounded" />
                              <div className="h-4 bg-default-200 rounded w-8" />
                              <div className="h-4 bg-default-200 rounded flex-1 max-w-xs" />
                            </div>
                            <div className="h-4 bg-default-200 rounded w-12" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description skeleton */}
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-default-200 rounded w-48" />
                <div className="space-y-3">
                  <div className="h-4 bg-default-200 rounded w-full" />
                  <div className="h-4 bg-default-200 rounded w-full" />
                  <div className="h-4 bg-default-200 rounded w-3/4" />
                  <div className="h-6 bg-default-200 rounded w-64 mt-6" />
                  <div className="h-4 bg-default-200 rounded w-full" />
                  <div className="h-4 bg-default-200 rounded w-5/6" />
                  <div className="h-6 bg-default-200 rounded w-56 mt-6" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-default-200 rounded w-full" />
                    ))}
                  </div>
                  <div className="h-6 bg-default-200 rounded w-52 mt-6" />
                  <div className="h-4 bg-default-200 rounded w-full" />
                  <div className="h-4 bg-default-200 rounded w-4/5" />
                </div>
              </div>

              {/* Reviews skeleton */}
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-default-200 rounded w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-default-50 border border-default-200 rounded-lg p-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <div
                              key={j}
                              className="h-4 w-4 bg-default-200 rounded"
                            />
                          ))}
                        </div>
                        <div className="h-4 bg-default-200 rounded w-28" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-default-200 rounded w-full" />
                        <div className="h-4 bg-default-200 rounded w-full" />
                        <div className="h-4 bg-default-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Information skeleton */}
              <div className="space-y-4 pb-8 animate-pulse">
                <div className="h-8 bg-default-200 rounded w-56" />
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="h-20 w-20 bg-default-200 rounded-full border-2 border-default-300" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="h-6 bg-default-200 rounded w-40 mb-2" />
                      <div className="h-4 bg-default-200 rounded w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 bg-default-200 rounded" />
                      <div className="h-4 bg-default-200 rounded w-12" />
                      <div className="h-4 w-4 bg-default-200 rounded-full" />
                      <div className="h-4 bg-default-200 rounded w-24" />
                      <div className="h-4 w-4 bg-default-200 rounded-full" />
                      <div className="h-4 bg-default-200 rounded w-20" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-4 bg-default-200 rounded w-full" />
                      <div className="h-4 bg-default-200 rounded w-full" />
                      <div className="h-4 bg-default-200 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Enrollment Card skeleton */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-default-200 rounded-lg shadow-lg overflow-hidden animate-pulse">
                  {/* Promo Video skeleton */}
                  <div className="relative aspect-video bg-default-200" />

                  {/* Card Content skeleton */}
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-default-200 rounded w-full" />
                    <div className="h-6 bg-default-200 rounded w-4/5" />

                    {/* Meta Info skeleton */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-4 bg-default-200 rounded w-16" />
                      <div className="h-3 w-3 bg-default-200 rounded-full" />
                      <div className="h-4 bg-default-200 rounded w-20" />
                      <div className="h-3 w-3 bg-default-200 rounded-full" />
                      <div className="h-4 bg-default-200 rounded w-16" />
                    </div>

                    {/* Enrollments skeleton */}
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 bg-default-200 rounded" />
                      <div className="h-4 bg-default-200 rounded w-32" />
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-default-200" />

                    {/* Action Buttons skeleton */}
                    <div className="space-y-3">
                      <div className="h-12 bg-default-200 rounded w-full" />
                      <div className="h-12 bg-default-200 rounded w-full" />
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
