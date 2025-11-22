"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInstructorProfile } from "@/app/api/instructor/getInstructorProfile";
import { getInstructorCourses } from "@/app/api/instructor/getInstructorCourses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/Common/CourseCard";
import { PaginationControl } from "@/components/ui/pagination-control";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  StarIcon,
  BookOpenIcon,
  GraduationCapIcon,
  AwardIcon,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/errorUtils";

export default function InstructorProfilePage() {
  const params = useParams();
  const instructorId = Number(params.instructorId);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 6;

  // Fetch instructor profile (once, cached forever)
  const {
    data: instructorProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["instructorProfile", instructorId],
    queryFn: () => getInstructorProfile(instructorId),
    enabled: !isNaN(instructorId) && instructorId > 0,
    staleTime: Infinity, // Never refetch instructor info
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });

  // Fetch instructor courses (paginated, refetches on page change)
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["instructorCourses", instructorId, currentPage],
    queryFn: () =>
      getInstructorCourses(instructorId, { page: currentPage, pageSize }),
    enabled: !isNaN(instructorId) && instructorId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle errors
  const error = profileError || coursesError;
  if (error) {
    return (
      <div className="min-h-screen bg-default-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-default-900 mb-2">
            Failed to load instructor profile
          </h1>
          <p className="text-default-600">{extractErrorMessage(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50 mt-16">
      {/* Instructor Header */}
      <div className="bg-linear-to-r from-primary-600 to-primary-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          {profileLoading ? (
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Skeleton className="size-32 rounded-full shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          ) : instructorProfile ? (
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <Avatar className="size-32 shrink-0 border-4 border-white shadow-lg">
                {instructorProfile.profilePictureUrl ? (
                  <AvatarImage
                    src={instructorProfile.profilePictureUrl}
                    alt={instructorProfile.fullName}
                  />
                ) : null}
                <AvatarFallback className="bg-white text-primary-600 text-3xl font-bold">
                  {getInitials(
                    instructorProfile.firstName,
                    instructorProfile.lastName
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {instructorProfile.fullName}
                </h1>
                {instructorProfile.professionalTitle && (
                  <p className="text-xl text-primary-50 mb-4">
                    {instructorProfile.professionalTitle}
                  </p>
                )}
                {instructorProfile.specialization && (
                  <Badge variant="secondary" className="mb-4">
                    {instructorProfile.specialization}
                  </Badge>
                )}
                {instructorProfile.bio && (
                  <p className="text-primary-50 leading-relaxed max-w-3xl">
                    {instructorProfile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center gap-2 text-white">
                    <BookOpenIcon className="size-5" />
                    <span className="font-semibold">
                      {instructorProfile.stats.totalCourses}
                    </span>
                    <span className="text-primary-100">Courses</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <GraduationCapIcon className="size-5" />
                    <span className="font-semibold">
                      {instructorProfile.stats.totalStudents.toLocaleString()}
                    </span>
                    <span className="text-primary-100">Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <AwardIcon className="size-5" />
                    <span className="font-semibold">
                      {instructorProfile.stats.totalReviews.toLocaleString()}
                    </span>
                    <span className="text-primary-100">Reviews</span>
                  </div>
                  {instructorProfile.stats.avgRating > 0 && (
                    <div className="flex items-center gap-2 text-white">
                      <StarIcon className="size-5 fill-white" />
                      <span className="font-semibold">
                        {instructorProfile.stats.avgRating.toFixed(1)}
                      </span>
                      <span className="text-primary-100">Rating</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-default-900 mb-2">
            Courses by {instructorProfile?.firstName || "Instructor"}
          </h2>
          {coursesData?.pagination && (
            <p className="text-default-600">
              {coursesData.pagination.totalItems}{" "}
              {coursesData.pagination.totalItems === 1 ? "course" : "courses"}{" "}
              available
            </p>
          )}
        </div>

        {/* Courses Grid */}
        {coursesLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-3/2 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : coursesData &&
          coursesData.courses &&
          coursesData.courses.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {coursesData.courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  slug={course.slug}
                  image={course.courseBannerUrl}
                  title={course.title}
                  company={instructorProfile?.fullName || "Instructor"}
                  rating={course.avgRating}
                  ratingCount={course.totalReviews}
                  enrollments={course.totalStudents}
                  impressions={0}
                  featured={false}
                  price={course.price}
                />
              ))}
            </div>

            {/* Pagination */}
            {coursesData.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <PaginationControl
                  currentPage={coursesData.pagination.currentPage}
                  totalPages={coursesData.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <BookOpenIcon className="size-12" />
            </EmptyHeader>
            <EmptyTitle>No Courses Yet</EmptyTitle>
            <EmptyDescription>
              This instructor hasn&apos;t published any courses yet. Check back
              later!
            </EmptyDescription>
          </Empty>
        )}
      </div>
    </div>
  );
}
