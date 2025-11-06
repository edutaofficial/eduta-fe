"use client";

import * as React from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
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
import { CourseCard } from "@/components/Common/CourseCard";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WishlistTab() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const itemsPerPage = 6;

  // Filter courses
  const filteredCourses = React.useMemo(() => {
    let courses = [...CONSTANTS.STUDENT_WISHLIST];

    // Apply search filter
    if (searchQuery) {
      courses = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return courses;
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search wishlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-default-300"
        />
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
      {paginatedCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedCourses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.courseId}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <CourseCard
                image={course.image}
                title={course.title}
                company={course.company}
                rating={course.rating}
                ratingCount={course.ratingCount}
                enrollments={course.enrollments}
                impressions={course.impressions}
                price={course.price}
              />
            </Link>
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
                No courses in your wishlist
              </h3>
              <p className="text-sm text-muted-foreground">
                Start adding courses to your wishlist to see them here
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
                  onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
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
                    currentPage === totalPages && "pointer-events-none opacity-50"
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

