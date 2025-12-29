"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogCard } from "./BlogCard";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";
import type { BlogFilters } from "@/types/blog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function BlogListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState(
    searchParams.get("search") || ""
  );
  const [selectedTag, setSelectedTag] = React.useState(
    searchParams.get("tag") || "all-tags"
  );
  const [featuredFilter, setFeaturedFilter] = React.useState<
    "all" | "featured" | "regular"
  >((searchParams.get("featured") as "all" | "featured" | "regular") || "all");
  const [currentPage, setCurrentPage] = React.useState(
    Number(searchParams.get("page")) || 1
  );

  const pageSize = 12;

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters for API
  const filters: BlogFilters = React.useMemo(() => {
    const f: BlogFilters = {
      page: currentPage,
      pageSize,
    };

    if (debouncedSearchQuery) f.search = debouncedSearchQuery;
    if (selectedTag && selectedTag !== "all-tags") f.tag = selectedTag;
    if (featuredFilter === "featured") f.isFeatured = true;
    if (featuredFilter === "regular") f.isFeatured = false;

    return f;
  }, [currentPage, debouncedSearchQuery, selectedTag, featuredFilter]);

  // Fetch blogs
  const {
    data: blogsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blogs", filters],
    queryFn: () => getAllBlogs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (selectedTag && selectedTag !== "all-tags")
      params.set("tag", selectedTag);
    if (featuredFilter !== "all") params.set("featured", featuredFilter);
    if (currentPage > 1) params.set("page", String(currentPage));

    const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearchQuery, selectedTag, featuredFilter, currentPage, router]);

  const posts = React.useMemo(() => blogsData?.data?.posts || [], [blogsData?.data?.posts]);
  const pagination = blogsData?.pagination;

  // Extract unique tags from posts for filter
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag.tagName));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedTag("all-tags");
    setFeaturedFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearchQuery ||
    (selectedTag && selectedTag !== "all-tags") ||
    featuredFilter !== "all";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-default-900 mb-2">Blog</h1>
        <p className="text-lg text-default-600">
          Discover articles, tutorials, and insights
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-default-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tag Filter */}
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-tags">All Tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Featured Filter */}
          <Select
            value={featuredFilter}
            onValueChange={(value) =>
              setFeaturedFilter(value as "all" | "featured" | "regular")
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
              <SelectItem value="regular">Regular Posts</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full md:w-auto"
            >
              <X className="size-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="size-4 text-default-500" />
            <span className="text-sm text-default-600">Active filters:</span>
            {debouncedSearchQuery && (
              <Badge variant="secondary">
                Search: {debouncedSearchQuery}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                  }}
                  className="ml-1.5 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {selectedTag && selectedTag !== "all-tags" && (
              <Badge variant="secondary">
                Tag: {selectedTag}
                <button
                  onClick={() => setSelectedTag("all-tags")}
                  className="ml-1.5 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {featuredFilter !== "all" && (
              <Badge variant="secondary">
                {featuredFilter === "featured" ? "Featured" : "Regular"}
                <button
                  onClick={() => setFeaturedFilter("all")}
                  className="ml-1.5 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {pagination && (
        <div className="mb-6 text-sm text-default-600">
          Showing {posts.length} of {pagination.totalItems} articles
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg bg-default-100 h-[400px]"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">
            Failed to load blog posts. Please try again later.
          </p>
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.blogId} {...post} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-default-600 mb-4">
            No blog posts found matching your criteria.
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    pagination.hasPrevious &&
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  className={
                    !pagination.hasPrevious
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // Show first page, last page, current page, and adjacent pages
                  return (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  );
                })
                .map((pageNum, idx, array) => {
                  // Add ellipsis
                  const prevPageNum = array[idx - 1];
                  const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {showEllipsis && (
                        <PaginationItem>
                          <span className="px-4">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={pageNum === currentPage}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.hasNext &&
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  className={
                    !pagination.hasNext
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
