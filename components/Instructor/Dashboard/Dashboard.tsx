"use client";

import * as React from "react";
import { PlusIcon, EditIcon, SearchIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InstructorCourseCard } from "../InstructorCourseCard";
import { DraftCourseCard } from "./DraftCourseCard";
import { DraftCourseCardSkeleton } from "@/components/skeleton/DraftCourseCardSkeleton";
import { InstructorCourseCardSkeleton } from "@/components/skeleton/InstructorCourseCardSkeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { getInstructorCourses } from "@/app/api/course/getInstructorCourses";
import { deleteCourse } from "@/app/api/course/deleteCourse";
import { useDebounce } from "@/hooks/useDebounce";

export function InstructorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [draftPage, setDraftPage] = React.useState(1);
  const [publishedPage, setPublishedPage] = React.useState(1);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const instructorId = user?.instructorId;

  // ============================================================================
  // DRAFT COURSES QUERY (TanStack Query with caching)
  // ============================================================================
  const {
    data: draftCoursesData,
    isLoading: loadingDrafts,
    error: draftError,
  } = useQuery({
    queryKey: ["instructorCourses", "draft", instructorId, draftPage],
    queryFn: () => {
      if (!instructorId) throw new Error("Instructor ID not found");
      return getInstructorCourses({
        instructorId,
        status: "draft",
        page: draftPage,
        pageSize: 3,
        sortBy: "created_at",
        order: "desc",
      });
    },
    enabled: !!instructorId,
    staleTime: 1000 * 60 * 2, // 2 minutes - drafts change frequently
    gcTime: 1000 * 60 * 10, // 10 minutes cache
  });

  // ============================================================================
  // PUBLISHED COURSES QUERY (TanStack Query with caching)
  // ============================================================================
  const {
    data: publishedCoursesData,
    isLoading: loadingPublished,
    error: publishedError,
  } = useQuery({
    queryKey: [
      "instructorCourses",
      "published",
      instructorId,
      publishedPage,
      debouncedSearchQuery,
    ],
    queryFn: () => {
      if (!instructorId) throw new Error("Instructor ID not found");
      return getInstructorCourses({
        instructorId,
        status: "published",
        query: debouncedSearchQuery || undefined,
        page: publishedPage,
        pageSize: 9,
        sortBy: "created_at",
        order: "desc",
      });
    },
    enabled: !!instructorId,
    staleTime: 1000 * 60 * 5, // 5 minutes - published courses don't change as often
    gcTime: 1000 * 60 * 15, // 15 minutes cache
  });

  // ============================================================================
  // DELETE COURSE MUTATION
  // ============================================================================
  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      // Invalidate and refetch published courses
      queryClient.invalidateQueries({
        queryKey: ["instructorCourses", "published"],
      });
    },
  });

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setPublishedPage(1);
  }, [debouncedSearchQuery]);

  // Extract data from queries
  const draftCourses = draftCoursesData?.data || [];
  const draftMeta = draftCoursesData?.meta || {
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  };

  const publishedCourses = publishedCoursesData?.data || [];
  const publishedMeta = publishedCoursesData?.meta || {
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  };

  // Combine errors
  const error = draftError || publishedError || deleteMutation.error;
  const errorMessage = error instanceof Error ? error.message : null;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleEditDraft = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/draft-complete`);
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/edit`);
  };

  const handlePublishSuccess = () => {
    // Invalidate both queries to refetch fresh data
    queryClient.invalidateQueries({
      queryKey: ["instructorCourses", "draft"],
    });
    queryClient.invalidateQueries({
      queryKey: ["instructorCourses", "published"],
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    deleteMutation.mutate(courseId);
  };

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-default-900">
          Instructor Dashboard
        </h1>
        <p className="text-muted-foreground text-base">
          Manage your courses and track your progress
        </p>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Draft Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-default-900 flex items-center gap-2">
              <EditIcon className="size-6 text-primary-600" />
              Drafts
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete and publish your courses
            </p>
          </div>
          {draftMeta.totalItems > 0 && (
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
              {draftMeta.totalItems} draft
              {draftMeta.totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingDrafts ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <DraftCourseCardSkeleton key={i} />
            ))}
          </div>
        ) : draftCourses.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {draftCourses.map((course) => (
              <DraftCourseCard
                key={course.courseId}
                course={course}
                onEdit={handleEditDraft}
                onPublish={handlePublishSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="bg-linear-to-br from-default-50 to-white border-2 border-dashed border-default-200 rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="size-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
                <EditIcon className="size-8 text-primary-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-default-900">
                  No drafts yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start creating your first course and save it as a draft
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Draft Pagination */}
        {draftMeta.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      !loadingDrafts &&
                      draftMeta.hasPrev &&
                      setDraftPage((p) => Math.max(1, p - 1))
                    }
                    className={cn(
                      "cursor-pointer",
                      (loadingDrafts || !draftMeta.hasPrev) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {[...Array(draftMeta.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const showPage =
                    pageNum === 1 ||
                    pageNum === draftMeta.totalPages ||
                    Math.abs(pageNum - draftPage) <= 1;

                  const showEllipsis =
                    (pageNum === 2 && draftPage > 3) ||
                    (pageNum === draftMeta.totalPages - 1 &&
                      draftPage < draftMeta.totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => !loadingDrafts && setDraftPage(pageNum)}
                        isActive={draftPage === pageNum}
                        className={cn(
                          !loadingDrafts && "cursor-pointer",
                          loadingDrafts && "pointer-events-none opacity-50"
                        )}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      !loadingDrafts &&
                      draftMeta.hasNext &&
                      setDraftPage((p) => Math.min(draftMeta.totalPages, p + 1))
                    }
                    className={cn(
                      "cursor-pointer",
                      (loadingDrafts || !draftMeta.hasNext) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

      {/* Published Courses Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-default-900 flex items-center gap-2">
              <CheckCircle2Icon className="size-6 text-success-600" />
              Published Courses
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your published courses
            </p>
          </div>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("course_creation_courseId");
              }
            }}
            asChild
            className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
            size="lg"
          >
            <Link href="/instructor/courses/create">
              <PlusIcon className="size-5" />
              Create New Course
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-default-200 p-4 shadow-sm">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-default-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Results Count */}
          {debouncedSearchQuery && !loadingPublished && (
            <div className="mt-3 pt-3 border-t border-default-200">
              <p className="text-sm text-muted-foreground">
                Found{" "}
                <span className="font-semibold text-default-900">
                  {publishedMeta.totalItems}
                </span>{" "}
                course{publishedMeta.totalItems !== 1 ? "s" : ""} matching
                &quot;
                <span className="font-medium text-default-900">
                  {debouncedSearchQuery}
                </span>
                &quot;
              </p>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loadingPublished ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <InstructorCourseCardSkeleton key={i} />
            ))}
          </div>
        ) : publishedCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedCourses.map((course) => (
              <InstructorCourseCard
                key={course.courseId}
                course={{
                  id: course.courseId,
                  title: course.title,
                  subtitle: course.instructorName || "Anonymous Instructor",
                  image: course.courseBannerUrl,
                  rating: course.avgRating || 0,
                  ratingCount: course.totalReviews || 0,
                  enrollments: course.totalStudents || 0,
                  impressions: 0,
                  status: course.status,
                  price: course.price || 0,
                }}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        ) : (
          <div className="bg-linear-to-br from-default-50 to-white border-2 border-dashed border-default-200 rounded-xl p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="size-16 mx-auto bg-default-100 rounded-full flex items-center justify-center">
                <SearchIcon className="size-8 text-default-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-default-900">
                  {debouncedSearchQuery
                    ? "No courses found"
                    : "No published courses yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearchQuery
                    ? "Try adjusting your search criteria"
                    : "Complete your draft courses to publish them"}
                </p>
              </div>
              {!debouncedSearchQuery && (
                <Button asChild className="gap-2 mt-4" size="lg">
                  <Link href="/instructor/courses/create">
                    <PlusIcon className="size-5" />
                    Create Your First Course
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Published Pagination */}
        {publishedMeta.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      !loadingPublished &&
                      publishedMeta.hasPrev &&
                      setPublishedPage((p) => Math.max(1, p - 1))
                    }
                    className={cn(
                      "cursor-pointer",
                      (loadingPublished || !publishedMeta.hasPrev) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {[...Array(publishedMeta.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const showPage =
                    pageNum === 1 ||
                    pageNum === publishedMeta.totalPages ||
                    Math.abs(pageNum - publishedPage) <= 1;

                  const showEllipsis =
                    (pageNum === 2 && publishedPage > 3) ||
                    (pageNum === publishedMeta.totalPages - 1 &&
                      publishedPage < publishedMeta.totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() =>
                          !loadingPublished && setPublishedPage(pageNum)
                        }
                        isActive={publishedPage === pageNum}
                        className={cn(
                          !loadingPublished && "cursor-pointer",
                          loadingPublished && "pointer-events-none opacity-50"
                        )}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      !loadingPublished &&
                      publishedMeta.hasNext &&
                      setPublishedPage((p) =>
                        Math.min(publishedMeta.totalPages, p + 1)
                      )
                    }
                    className={cn(
                      "cursor-pointer",
                      (loadingPublished || !publishedMeta.hasNext) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  );
}
