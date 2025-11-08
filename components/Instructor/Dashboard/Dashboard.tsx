"use client";

import * as React from "react";
import {
  PlusIcon,
  EditIcon,
  SearchIcon,
  FilterIcon,
  CheckCircle2Icon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstructorCourseCard } from "../InstructorCourseCard";
import { DraftCourseCard } from "./DraftCourseCard";
import { DraftCourseCardSkeleton } from "@/components/skeleton/DraftCourseCardSkeleton";
import { InstructorCourseCardSkeleton } from "@/components/skeleton/InstructorCourseCardSkeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getInstructorCourses,
  type InstructorCoursesParams,
  type InstructorCourse,
} from "@/app/api/course/getInstructorCourses";
import { deleteCourse } from "@/app/api/course/deleteCourse";

export function InstructorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    "all" | "draft" | "published" | "archived"
  >("all");

  // Draft courses state
  const [draftCourses, setDraftCourses] = React.useState<InstructorCourse[]>(
    []
  );
  const [draftPage, setDraftPage] = React.useState(1);
  const [draftMeta, setDraftMeta] = React.useState({
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  });
  const [loadingDrafts, setLoadingDrafts] = React.useState(false);

  // Published courses state
  const [publishedCourses, setPublishedCourses] = React.useState<
    InstructorCourse[]
  >([]);
  const [publishedPage, setPublishedPage] = React.useState(1);
  const [publishedMeta, setPublishedMeta] = React.useState({
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    totalItems: 0,
  });
  const [loadingPublished, setLoadingPublished] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get instructorId from user token
  const instructorId = user?.instructorId;

  // Fetch draft courses
  const fetchDraftCourses = React.useCallback(async () => {
    if (!instructorId) return;

    setLoadingDrafts(true);
    setError(null);

    try {
      const params: InstructorCoursesParams = {
        instructorId,
        status: "draft",
        page: draftPage,
        pageSize: 3, // 3 drafts per page
        sortBy: "created_at",
        order: "desc",
      };

      const response = await getInstructorCourses(params);
      setDraftCourses(response.data);
      setDraftMeta({
        totalPages: response.meta.totalPages,
        hasNext: response.meta.hasNext,
        hasPrev: response.meta.hasPrev,
        totalItems: response.meta.totalItems,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch draft courses"
      );
    } finally {
      setLoadingDrafts(false);
    }
  }, [instructorId, draftPage]);

  // Fetch published courses
  const fetchPublishedCourses = React.useCallback(async () => {
    if (!instructorId) return;

    setLoadingPublished(true);
    setError(null);

    try {
      const params: InstructorCoursesParams = {
        instructorId,
        status: filterStatus === "all" ? undefined : filterStatus,
        query: searchQuery || undefined,
        page: publishedPage,
        pageSize: 9, // 9 courses per page (3x3 grid)
        sortBy: "created_at",
        order: "desc",
      };

      const response = await getInstructorCourses(params);
      setPublishedCourses(response.data);
      setPublishedMeta({
        totalPages: response.meta.totalPages,
        hasNext: response.meta.hasNext,
        hasPrev: response.meta.hasPrev,
        totalItems: response.meta.totalItems,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch published courses"
      );
    } finally {
      setLoadingPublished(false);
    }
  }, [instructorId, publishedPage, filterStatus, searchQuery]);

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchDraftCourses();
  }, [fetchDraftCourses]);

  React.useEffect(() => {
    fetchPublishedCourses();
  }, [fetchPublishedCourses]);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPublishedPage(1); // Reset to page 1 on search
      fetchPublishedCourses();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleEditDraft = (courseId: string) => {
    // Navigate to draft-complete route
    router.push(`/instructor/courses/${courseId}/draft-complete`);
  };

  const handleEditCourse = (courseId: string) => {
    // Navigate to edit route
    router.push(`/instructor/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setError(null);
      await deleteCourse(courseId);

      // Refresh the published courses list
      await fetchPublishedCourses();

      // Show success message (optional - you could use toast notification)
      // eslint-disable-next-line no-console
      console.log("Course deleted successfully");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete course. Please try again."
      );
    }
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
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
          {error}
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

        {/* Draft Pagination - always visible to prevent layout shifts */}
        {draftMeta.totalItems > 0 && (
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
                      (loadingDrafts ||
                        !draftMeta.hasPrev ||
                        draftMeta.totalPages <= 1) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {[...Array(Math.max(1, draftMeta.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
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
                          loadingDrafts || draftMeta.totalPages <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
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
                      (loadingDrafts ||
                        !draftMeta.hasNext ||
                        draftMeta.totalPages <= 1) &&
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
              // Clear any existing course creation data
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-default-200 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Search courses by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-default-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 h-11 min-w-[140px] border-default-300 hover:border-primary-400 hover:bg-primary-50"
                >
                  <FilterIcon className="size-4" />
                  {filterStatus === "all"
                    ? "All Status"
                    : filterStatus.charAt(0).toUpperCase() +
                      filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setFilterStatus("all");
                    setPublishedPage(1);
                  }}
                  className={cn(
                    "cursor-pointer",
                    filterStatus === "all" &&
                      "bg-primary-50 text-primary-600 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {filterStatus === "all" && (
                      <CheckCircle2Icon className="size-4" />
                    )}
                    All Status
                  </span>
                </DropdownMenuItem>
                <div className="my-1 h-px bg-default-200" />
                <DropdownMenuItem
                  onClick={() => {
                    setFilterStatus("published");
                    setPublishedPage(1);
                  }}
                  className={cn(
                    "cursor-pointer",
                    filterStatus === "published" &&
                      "bg-primary-50 text-primary-600 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {filterStatus === "published" && (
                      <CheckCircle2Icon className="size-4" />
                    )}
                    Published
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setFilterStatus("archived");
                    setPublishedPage(1);
                  }}
                  className={cn(
                    "cursor-pointer",
                    filterStatus === "archived" &&
                      "bg-primary-50 text-primary-600 font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {filterStatus === "archived" && (
                      <CheckCircle2Icon className="size-4" />
                    )}
                    Archived
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results Count */}
          {(searchQuery || filterStatus !== "all") && (
            <div className="mt-3 pt-3 border-t border-default-200">
              <p className="text-sm text-muted-foreground">
                Found{" "}
                <span className="font-semibold text-default-900">
                  {publishedMeta.totalItems}
                </span>{" "}
                course{publishedMeta.totalItems !== 1 ? "s" : ""}{" "}
                {searchQuery && (
                  <>
                    matching &quot;
                    <span className="font-medium text-default-900">
                      {searchQuery}
                    </span>
                    &quot;
                  </>
                )}
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
                  impressions: 0, // Not available in API response
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
                  {searchQuery || filterStatus !== "all"
                    ? "No courses found"
                    : "No courses yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first course to get started"}
                </p>
              </div>
              {!searchQuery && filterStatus === "all" && (
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

        {/* Published Pagination - always visible to prevent layout shifts */}
        {publishedMeta.totalItems > 0 && (
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
                      (loadingPublished ||
                        !publishedMeta.hasPrev ||
                        publishedMeta.totalPages <= 1) &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {[...Array(Math.max(1, publishedMeta.totalPages))].map(
                  (_, i) => {
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
                            loadingPublished || publishedMeta.totalPages <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          )}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

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
                      (loadingPublished ||
                        !publishedMeta.hasNext ||
                        publishedMeta.totalPages <= 1) &&
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
