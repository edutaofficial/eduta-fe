"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { StudentCourseCard } from "./StudentCourseCard";
import { RatingDialog } from "./RatingDialog";
import { useLearnerStore } from "@/store/useLearnerStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type FilterStatus = "all" | "completed" | "in_progress";

export function CoursesTab() {
  const { enrolledCourses, loading, fetchEnrolledCourses } = useLearnerStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<
    (typeof enrolledCourses)[0] | null
  >(null);

  const itemsPerPage = 6;

  // Fetch courses on mount
  React.useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Filter and search courses
  const filteredCourses = React.useMemo(() => {
    let courses = [...enrolledCourses];

    // Apply search filter
    if (searchQuery) {
      courses = courses.filter(
        (course) =>
          course.courseTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructorName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      courses = courses.filter((course) => {
        if (filterStatus === "completed") {
          return course.status === "completed";
        } else if (filterStatus === "in_progress") {
          return course.status === "in_progress" || course.status === "ongoing";
        }
        return true;
      });
    }

    return courses;
  }, [enrolledCourses, searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle rating
  const handleRate = (enrollmentId: string) => {
    const course = enrolledCourses.find((c) => c.enrollmentId === enrollmentId);
    setSelectedCourse(course || null);
    setRatingDialogOpen(true);
  };

  const handleRatingSuccess = () => {
    // Refetch enrolled courses to update the UI
    fetchEnrolledCourses();
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-default-300"
          />
        </div>

        {/* Filter Dropdown */}
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as FilterStatus)}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white border-default-300">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-default-700">
          Showing{" "}
          <span className="font-semibold text-default-900">
            {filteredCourses.length}
          </span>{" "}
          results
        </p>
      </div>

      {/* Courses Grid */}
      {loading.fetchEnrolledCourses ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-default-200 overflow-hidden"
            >
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedCourses.map((course) => (
            <StudentCourseCard
              key={course.enrollmentId}
              id={course.enrollmentId}
              courseId={course.courseId}
              title={course.courseTitle}
              instructor={course.instructorName}
              image={course.courseBannerUrl || ""} // Use banner URL if available, otherwise placeholder
              progress={course.progressPercentage}
              rating={0}
              hasRated={false}
              onRate={handleRate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-default-200 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="size-16 mx-auto bg-default-100 rounded-full flex items-center justify-center">
              <SearchIcon className="size-8 text-default-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-default-900">
                No courses found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && paginatedCourses.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && setCurrentPage((p) => p - 1)
                  }
                  className={cn(
                    "cursor-pointer",
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 1;

                const showEllipsis =
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2);

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
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage((p) => p + 1)
                  }
                  className={cn(
                    "cursor-pointer",
                    currentPage === totalPages &&
                      "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Rating Dialog */}
      {selectedCourse && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          courseId={selectedCourse.courseId}
          courseTitle={selectedCourse.courseTitle}
          enrollmentId={selectedCourse.enrollmentId}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}
