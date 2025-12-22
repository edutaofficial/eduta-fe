"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCategoryBySlug } from "@/app/api/category/getCategoryBySlug";
import { searchCourses } from "@/app/api/course/searchCourses";
import { CourseCard } from "@/components/Common/CourseCard";
import { CourseCardSkeleton } from "@/components/skeleton/CourseCardSkeleton";
import FAQComponent from "@/components/Home/FAQ";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const COURSES_PER_PAGE = 9;

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = React.use(params);
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch category details
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug(slug),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch courses for this category
  const {
    data: coursesData,
    isLoading: coursesLoading,
  } = useQuery({
    queryKey: ["category-courses", slug, currentPage],
    queryFn: () =>
      searchCourses({
        categorySlug: slug,
        page: currentPage,
        pageSize: COURSES_PER_PAGE,
      }),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const totalPages = coursesData?.meta.totalPages || 1;
  const totalCourses = coursesData?.meta.totalItems || 0;
  const courses = coursesData?.data.courses || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (categoryLoading) {
    return <CategoryDetailSkeleton />;
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 ">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="size-16 mx-auto bg-error-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="size-8 text-error-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-default-900 mb-2">
            Category Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The category you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/topics")}>
            Browse All Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50 mt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          {category.parent && (
            <div className="flex items-center gap-2 text-sm mb-4 text-primary-100">
              <Link href="/topics" className="hover:text-white transition-colors">
                All Topics
              </Link>
              <ChevronRight className="size-4" />
              <Link
                href={`/category/${category.parent.slug}`}
                className="hover:text-white transition-colors"
              >
                {category.parent.name}
              </Link>
              <ChevronRight className="size-4" />
              <span className="text-white">{category.name}</span>
            </div>
          )}

          <div className="flex items-start gap-6">
            {/* Category Icon */}
            {category.iconUrl && (
              <div className="size-20 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Image
                  src={category.iconUrl}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="size-12"
                />
              </div>
            )}

            {/* Category Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-primary-100 leading-relaxed max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Section */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="bg-white border-b border-default-200 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-default-900 mb-6">
              Explore Subcategories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.categoryId}
                  href={`/category/${sub.slug}`}
                  className="group p-4 border border-default-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    {sub.iconUrl && (
                      <Image
                        src={sub.iconUrl}
                        alt={sub.name}
                        width={32}
                        height={32}
                        className="size-8"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-default-900 group-hover:text-primary-600 transition-colors">
                        {sub.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-default-900">
            {category.name} Courses
          </h2>
          <p className="text-default-600">
            {totalCourses} courses
          </p>
        </div>

        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  slug={course.slug}
                  image={course.courseBannerUrl}
                  title={course.title}
                  company={`${course.instructor.firstName} ${course.instructor.lastName}`}
                  rating={parseFloat(course.stats.avgRating) || 0}
                  ratingCount={course.stats.totalReviews}
                  enrollments={course.stats.totalStudents}
                  totalLectures={course.stats.totalLectures}
                  totalDuration={course.stats.totalDurationFormatted}
                  learningLevel={course.learningLevel}
                  featured={false}
                  price={
                    course.pricing && course.pricing.amount
                      ? parseFloat(course.pricing.amount)
                      : 0
                  }
                  originalPrice={
                    course.pricing && course.pricing.originalAmount
                      ? parseFloat(course.pricing.originalAmount)
                      : undefined
                  }
                  discountPercentage={course.pricing?.discountPercentage || 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-default-600">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="size-20 mx-auto bg-default-200 rounded-full flex items-center justify-center mb-4">
              <svg
                className="size-10 text-default-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-default-900 mb-2">
              No Courses Available
            </h3>
            <p className="text-default-600 mb-6">
              There are no courses in this category yet. Check back soon!
            </p>
            <Button onClick={() => router.push("/topics")}>
              Browse All Courses
            </Button>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      {category.faqs && category.faqs.length > 0 && (
        <div className="bg-white py-12">
          <FAQComponent faqs={category.faqs} />
        </div>
      )}
    </div>
  );
}

// Skeleton Loader Component
function CategoryDetailSkeleton() {
  return (
    <div className="min-h-screen bg-default-50">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="size-20 bg-white/20 rounded-xl animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-10 bg-white/20 rounded w-1/3 animate-pulse" />
              <div className="h-6 bg-white/20 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Skeleton */}
      <div className="bg-white border-b border-default-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-default-200 rounded w-64 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-default-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Courses Skeleton */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 bg-default-200 rounded w-48 animate-pulse" />
          <div className="h-6 bg-default-200 rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-default-200 h-48 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-default-200 rounded w-3/4" />
                <div className="h-3 bg-default-200 rounded w-full" />
                <div className="h-3 bg-default-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

