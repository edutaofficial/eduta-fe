import { SearchIcon } from "lucide-react";
import { CourseCard } from "@/components/Common/CourseCard";
import { CourseCardSkeleton } from "@/components/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PublicCourse } from "@/types/course";

export type SortOption =
  | "created_at-desc"
  | "created_at-asc"
  | "title-asc"
  | "title-desc"
  | "published_at-desc";

interface CoursesGridProps {
  courses: PublicCourse[];
  loading: boolean;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onPageChange: (page: number) => void;
}

export function CoursesGrid({
  courses,
  loading,
  totalResults,
  currentPage,
  totalPages,
  sortBy,
  onSortChange,
  onPageChange,
}: CoursesGridProps) {
  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-default-700 text-sm md:text-base">
          <span className="font-semibold text-default-900">{totalResults}</span>{" "}
          results found
        </p>

        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[180px] border-default-300 bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="title-asc">Title: A-Z</SelectItem>
            <SelectItem value="title-desc">Title: Z-A</SelectItem>
            <SelectItem value="published_at-desc">
              Recently Published
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              impressions={0}
              featured={false}
              price={
                course.pricing && course.pricing.amount
                  ? parseFloat(course.pricing.amount)
                  : 0
              }
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
      {totalPages > 1 && !loading && courses.length > 0 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && onPageChange(currentPage - 1)
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
                      onClick={() => onPageChange(pageNum)}
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
                    currentPage < totalPages && onPageChange(currentPage + 1)
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
    </div>
  );
}
