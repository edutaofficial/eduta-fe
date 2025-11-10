"use client";

import * as React from "react";
import { SearchIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/Common";
import { useLearnerStore } from "@/store/useLearnerStore";
import { cn } from "@/lib/utils";

export function WishlistTab() {
  const { wishlist, loading, fetchWishlist, removeFromWishlist } =
    useLearnerStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<
    (typeof wishlist)[0] | null
  >(null);

  const itemsPerPage = 6;

  // Fetch wishlist on mount
  React.useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Filter and search wishlist
  const filteredWishlist = React.useMemo(() => {
    let items = [...wishlist];

    // Apply search filter
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  }, [wishlist, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage);
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle remove from wishlist
  const handleRemoveClick = (item: (typeof wishlist)[0]) => {
    setCourseToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!courseToDelete) return;

    try {
      await removeFromWishlist(courseToDelete.courseId);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to remove from wishlist:", error);
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          <Input
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-default-300"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-default-700">
          Showing{" "}
          <span className="font-semibold text-default-900">
            {filteredWishlist.length}
          </span>{" "}
          {filteredWishlist.length === 1 ? "course" : "courses"} in wishlist
        </p>
      </div>

      {/* Wishlist Grid */}
      {loading.fetchWishlist ? (
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
      ) : paginatedWishlist.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedWishlist.map((item) => (
            <div key={item.wishlistId} className="relative">
              {/* Dropdown Menu */}
              <div className="absolute top-4 right-4 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 bg-white/90 hover:bg-white shadow-sm"
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRemoveClick(item)}
                      className="text-error-600 focus:text-error-700"
                    >
                      <TrashIcon className="size-4 mr-2" />
                      Remove from Wishlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CourseCard
                id={item.courseId}
                image={item.courseBannerUrl || ""} // Use banner URL if available, otherwise placeholder
                title={item.courseTitle}
                company={item.instructorName}
                rating={item.avgRating}
                ratingCount={item.totalReviews}
                enrollments={item.totalStudents}
                impressions={item.totalStudents * 3} // Estimated impressions
                price={item.price}
                featured={false}
              />
            </div>
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
                No courses in wishlist
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Start adding courses to your wishlist to see them here"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && paginatedWishlist.length > 0 && (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-default-900">
                {courseToDelete?.courseTitle}
              </span>{" "}
              from your wishlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-error-600 hover:bg-error-700"
              disabled={loading.removeFromWishlist}
            >
              {loading.removeFromWishlist ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
