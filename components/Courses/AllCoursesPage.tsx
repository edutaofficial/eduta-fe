"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CoursesSearchBar } from "./CoursesSearchBar";
import { CoursesFilters, type SkillLevel } from "./CoursesFilters";
import { CoursesGrid, type SortOption } from "./CoursesGrid";
import {
  searchCourses,
  type SearchCoursesParams,
} from "@/app/api/course/searchCourses";
import { useCategoryStore } from "@/store/useCategoryStore";

interface AllCoursesPageProps {
  className?: string;
}

export function AllCoursesPage({ className: _className }: AllCoursesPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("query") || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState(
    searchParams.get("query") || ""
  );
  const [sortBy, setSortBy] = React.useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "created_at-desc"
  );
  const [currentPage, setCurrentPage] = React.useState(
    Number(searchParams.get("page")) || 1
  );

  // Filters from URL
  const [selectedLevels, setSelectedLevels] = React.useState<SkillLevel[]>(
    (searchParams.get("levels")?.split(",").filter(Boolean) as SkillLevel[]) ||
      []
  );
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [selectedDurations, setSelectedDurations] = React.useState<string[]>(
    searchParams.get("durations")?.split(",").filter(Boolean) || []
  );
  const [minRating, setMinRating] = React.useState<number>(
    Number(searchParams.get("rating")) || 0
  );

  const itemsPerPage = 9;

  // Helper function to convert duration ranges to min/max hours
  const getDurationRange = (
    durations: string[]
  ): { min?: number; max?: number } => {
    if (durations.length === 0) return {};

    let min = Infinity;
    let max = 0;

    durations.forEach((duration) => {
      switch (duration) {
        case "0-5":
          min = Math.min(min, 0);
          max = Math.max(max, 5);
          break;
        case "6-10":
          min = Math.min(min, 6);
          max = Math.max(max, 10);
          break;
        case "11-15":
          min = Math.min(min, 11);
          max = Math.max(max, 15);
          break;
        case "16+":
          min = Math.min(min, 16);
          max = Math.max(max, 1000); // Large number to represent "any duration above 16"
          break;
      }
    });

    return {
      min: min === Infinity ? undefined : min,
      max: max === 0 ? undefined : max,
    };
  };

  /**
   * Optimizes category selection for API
   * - Categories with no subcategories: pass parent ID directly
   * - If all subcategories of a parent are selected: return only parent ID
   * - Otherwise: return only the selected subcategory IDs
   */
  const getOptimizedCategoryIds = React.useCallback(
    (
      selectedIds: string[],
      categories: Array<{
        categoryId: string;
        subcategories: Array<{ categoryId: string }>;
      }>
    ): string[] => {
      if (selectedIds.length === 0) return [];

      const optimized = new Set<string>();
      const processedParents = new Set<string>();

      categories.forEach((parent) => {
        const hasSubcategories = parent.subcategories.length > 0;

        // If no subcategories, check if parent itself is selected
        if (!hasSubcategories) {
          if (selectedIds.includes(parent.categoryId)) {
            optimized.add(parent.categoryId);
            processedParents.add(parent.categoryId);
          }
          return;
        }

        // Check if parent itself is selected (shouldn't happen with subcategories, but handle it)
        if (selectedIds.includes(parent.categoryId)) {
          optimized.add(parent.categoryId);
          processedParents.add(parent.categoryId);
          return;
        }

        // Get selected subcategories for this parent
        const selectedSubs = parent.subcategories.filter((sub) =>
          selectedIds.includes(sub.categoryId)
        );

        // If all subcategories are selected, use parent ID instead
        if (
          selectedSubs.length > 0 &&
          selectedSubs.length === parent.subcategories.length
        ) {
          optimized.add(parent.categoryId);
          processedParents.add(parent.categoryId);
        } else {
          // Otherwise, use individual subcategory IDs
          selectedSubs.forEach((sub) => optimized.add(sub.categoryId));
        }
      });

      return Array.from(optimized);
    },
    []
  );

  // Debounce search query - wait 500ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change
  const updateURL = React.useCallback(
    (updates: Record<string, string | number | string[] | null>) => {
      const params = new URLSearchParams();

      // Build params object with all current values
      const allParams = {
        query: debouncedSearchQuery,
        levels: selectedLevels,
        categories: selectedCategories,
        durations: selectedDurations,
        rating: minRating,
        sort: sortBy,
        page: currentPage,
        ...updates,
      };

      // Add params to URL
      if (allParams.query) params.set("query", allParams.query as string);
      if (Array.isArray(allParams.levels) && allParams.levels.length > 0) {
        params.set("levels", allParams.levels.join(","));
      }
      if (
        Array.isArray(allParams.categories) &&
        allParams.categories.length > 0
      ) {
        params.set("categories", allParams.categories.join(","));
      }
      if (
        Array.isArray(allParams.durations) &&
        allParams.durations.length > 0
      ) {
        params.set("durations", allParams.durations.join(","));
      }
      if (allParams.rating && allParams.rating > 0) {
        params.set("rating", String(allParams.rating));
      }
      if (allParams.sort) params.set("sort", allParams.sort as string);
      if (allParams.page && allParams.page > 1) {
        params.set("page", String(allParams.page));
      }

      const queryString = params.toString();
      router.push(queryString ? `/all-courses?${queryString}` : "/all-courses");
    },
    [
      debouncedSearchQuery,
      selectedLevels,
      selectedCategories,
      selectedDurations,
      minRating,
      sortBy,
      currentPage,
      router,
    ]
  );

  // Build search params for API using debounced search query
  const apiParams = React.useMemo((): SearchCoursesParams => {
    const [sortField, order] = sortBy.split("-") as [
      "created_at" | "title" | "published_at",
      "asc" | "desc",
    ];

    // Optimize category selection - send parent ID if all subcategories are selected
    const optimizedCategoryIds = getOptimizedCategoryIds(
      selectedCategories,
      categories
    );

    return {
      query: debouncedSearchQuery || undefined,
      categoryId:
        optimizedCategoryIds.length > 0
          ? optimizedCategoryIds.join(",")
          : undefined,
      learningLevel:
        selectedLevels.length > 0 ? selectedLevels.join(",") : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      sortBy: sortField,
      order,
      page: currentPage,
      pageSize: itemsPerPage,
      // Duration filtering (will be handled by backend)
      minDuration:
        selectedDurations.length > 0
          ? getDurationRange(selectedDurations).min
          : undefined,
      maxDuration:
        selectedDurations.length > 0
          ? getDurationRange(selectedDurations).max
          : undefined,
    };
  }, [
    debouncedSearchQuery,
    selectedLevels,
    selectedCategories,
    selectedDurations,
    minRating,
    sortBy,
    currentPage,
    categories,
    getOptimizedCategoryIds,
  ]);

  // Use TanStack Query for data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", apiParams],
    queryFn: () => searchCourses(apiParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const courses = data?.data || [];
  const meta = data?.meta || {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 9,
    hasNext: false,
    hasPrevious: false,
  };

  // Update URL when debounced search query changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchParams.get("query")) {
      setCurrentPage(1);
      updateURL({ query: debouncedSearchQuery, page: 1 });
    }
  }, [debouncedSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter handlers
  const handleLevelToggle = (level: SkillLevel) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    setSelectedLevels(newLevels);
    setCurrentPage(1);
    updateURL({ levels: newLevels, page: 1 });
  };

  /**
   * Handles hierarchical category selection
   * - Categories with subcategories: check/uncheck all subcategories
   * - Categories without subcategories: toggle parent directly
   * - Subcategories: toggle individually, update parent state
   */
  const handleCategoryToggle = React.useCallback(
    (categoryId: string, isParent: boolean) => {
      let newCategories: string[] = [];

      if (isParent) {
        // Parent category toggled
        const parent = categories.find((c) => c.categoryId === categoryId);
        if (!parent) return;

        const allSubcategoryIds = parent.subcategories.map(
          (sub) => sub.categoryId
        );
        const hasSubcategories = allSubcategoryIds.length > 0;

        if (hasSubcategories) {
          // Parent has subcategories - manage them
          if (selectedCategories.includes(categoryId)) {
            // Uncheck parent: remove parent and all its subcategories
            newCategories = selectedCategories.filter(
              (id) => id !== categoryId && !allSubcategoryIds.includes(id)
            );
          } else {
            // Check parent: add all subcategories (not parent itself)
            const otherSelections = selectedCategories.filter(
              (id) => !allSubcategoryIds.includes(id) && id !== categoryId
            );
            newCategories = [...otherSelections, ...allSubcategoryIds];
          }
        } else {
          // Parent has NO subcategories - toggle parent itself
          if (selectedCategories.includes(categoryId)) {
            // Uncheck parent
            newCategories = selectedCategories.filter(
              (id) => id !== categoryId
            );
          } else {
            // Check parent
            newCategories = [...selectedCategories, categoryId];
          }
        }
      } else {
        // Subcategory toggled
        if (selectedCategories.includes(categoryId)) {
          // Uncheck subcategory
          newCategories = selectedCategories.filter((id) => id !== categoryId);

          // Also remove parent if it was included
          const parentCategory = categories.find((c) =>
            c.subcategories.some((sub) => sub.categoryId === categoryId)
          );
          if (parentCategory) {
            newCategories = newCategories.filter(
              (id) => id !== parentCategory.categoryId
            );
          }
        } else {
          // Check subcategory
          newCategories = [...selectedCategories, categoryId];

          // Remove parent if it exists (we'll let optimization handle this)
          const parentCategory = categories.find((c) =>
            c.subcategories.some((sub) => sub.categoryId === categoryId)
          );
          if (parentCategory) {
            newCategories = newCategories.filter(
              (id) => id !== parentCategory.categoryId
            );
          }
        }
      }

      setSelectedCategories(newCategories);
      setCurrentPage(1);
      updateURL({ categories: newCategories, page: 1 });
    },
    [selectedCategories, categories, updateURL]
  );

  const handleDurationToggle = (duration: string) => {
    const newDurations = selectedDurations.includes(duration)
      ? selectedDurations.filter((d) => d !== duration)
      : [...selectedDurations, duration];
    setSelectedDurations(newDurations);
    setCurrentPage(1);
    updateURL({ durations: newDurations, page: 1 });
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    setCurrentPage(1);
    updateURL({ rating, page: 1 });
  };

  const handleClearFilters = () => {
    setSelectedLevels([]);
    setSelectedCategories([]);
    setSelectedDurations([]);
    setMinRating(0);
    setCurrentPage(1);
    router.push("/all-courses");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURL({ sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  return (
    <div className="px-4 bg-default-50 py-[120px]">
      <div className="mx-auto max-w-container">
        {/* Header Section */}
        <div className="text-center flex items-center justify-center flex-col mb-8 space-y-4">
          <Badge variant="info" className="px-4 py-2 text-sm font-medium">
            Explore and Grow
          </Badge>
          <h1 className="text-4xl md:text-5xl max-w-3xl font-bold text-default-900">
            Learn from Industry experts and upgrade your potencies
          </h1>
        </div>

        {/* Search Bar */}
        <CoursesSearchBar value={searchQuery} onChange={handleSearchChange} />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
            {error instanceof Error ? error.message : "Failed to fetch courses"}
          </div>
        )}

        {/* Main Content: Filters + Courses Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          <CoursesFilters
            selectedLevels={selectedLevels}
            selectedCategories={selectedCategories}
            selectedDurations={selectedDurations}
            minRating={minRating}
            onLevelToggle={handleLevelToggle}
            onCategoryToggle={handleCategoryToggle}
            onDurationToggle={handleDurationToggle}
            onRatingChange={handleRatingChange}
            onClearAll={handleClearFilters}
          />

          <CoursesGrid
            courses={courses}
            loading={isLoading}
            totalResults={meta.totalItems}
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
