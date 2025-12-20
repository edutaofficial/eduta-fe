"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getInstructorProfile } from "@/app/api/instructor/getInstructorProfile";
import { getInstructorCourses } from "@/app/api/instructor/getInstructorCourses";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AwardIcon,
  UsersIcon,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/errorUtils";

interface InstructorProfileProps {
  instructorId: number;
}

export function InstructorProfile({ instructorId }: InstructorProfileProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 12;

  // Fetch instructor profile
  const {
    data: instructorProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["instructorProfile", instructorId],
    queryFn: () => getInstructorProfile(instructorId),
    enabled: !isNaN(instructorId) && instructorId > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch instructor courses
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["instructorCourses", instructorId, currentPage],
    queryFn: () =>
      getInstructorCourses(instructorId, { page: currentPage, pageSize }),
    enabled: !isNaN(instructorId) && instructorId > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
    <div className="min-h-screen pt-20 bg-default-50">
    

      {/* Main Content with Sticky Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="flex-1">
            {/* About Me Section */}
            {instructorProfile?.bio && (
              <div className="bg-white rounded-lg border border-default-200 p-6 mb-8">
                <h2 className="text-2xl font-bold text-default-900 mb-4">
                  About me
                </h2>
                <p className="text-default-700 leading-relaxed whitespace-pre-wrap">
                  {instructorProfile.bio}
                </p>
              </div>
            )}

            {/* Courses Section */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-default-900 mb-2">
                  Courses by {instructorProfile?.firstName || "Instructor"}
                </h2>
                {coursesData?.pagination && (
                  <p className="text-default-600">
                    {coursesData.pagination.totalItems}{" "}
                    {coursesData.pagination.totalItems === 1 ? "course" : "courses"}
                  </p>
                )}
              </div>

              {/* Courses Grid */}
              {coursesLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(pageSize)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-video w-full rounded-lg" />
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

          {/* Right Column - Sticky Profile Card */}
          <div className="lg:w-80 shrink-0">
            {profileLoading ? (
              <div className="bg-white rounded-lg border border-default-200 p-6 space-y-4">
                <Skeleton className="size-32 rounded-full mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : instructorProfile ? (
              <div className="lg:sticky lg:top-24 bg-white rounded-lg border border-default-200 p-6 shadow-sm">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <Avatar className="size-32 border-4 border-default-200 shadow-md">
                    {instructorProfile.profilePictureUrl ? (
                      <AvatarImage
                        src={instructorProfile.profilePictureUrl}
                        alt={instructorProfile.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-3xl font-bold">
                      {getInitials(
                        instructorProfile.firstName,
                        instructorProfile.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name and Title */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-default-900 mb-2">
                    {instructorProfile.fullName}
                  </h2>
                  {instructorProfile.professionalTitle && (
                    <p className="text-base text-default-700 mb-2">
                      {instructorProfile.professionalTitle}
                    </p>
                  )}
                  {instructorProfile.specialization && (
                    <p className="text-sm text-default-600">
                      {instructorProfile.specialization}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-4 pt-6 border-t border-default-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="size-5 text-primary-600" />
                      <span className="text-default-600">Students</span>
                    </div>
                    <span className="text-default-900 font-semibold">
                      {instructorProfile.stats.totalStudents.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="size-5 text-primary-600" />
                      <span className="text-default-600">Courses</span>
                    </div>
                    <span className="text-default-900 font-semibold">
                      {instructorProfile.stats.totalCourses}
                    </span>
                  </div>
                  {instructorProfile.stats.avgRating > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarIcon className="size-5 text-primary-600 fill-primary-600" />
                        <span className="text-default-600">Rating</span>
                      </div>
                      <span className="text-default-900 font-semibold">
                        {instructorProfile.stats.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AwardIcon className="size-5 text-primary-600" />
                      <span className="text-default-600">Reviews</span>
                    </div>
                    <span className="text-default-900 font-semibold">
                      {instructorProfile.stats.totalReviews.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

