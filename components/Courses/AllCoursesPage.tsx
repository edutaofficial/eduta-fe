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
  slugs?: string[]; // For slug-based routing from dynamic route
  initialData?: Awaited<ReturnType<typeof searchCourses>>;
}

export function AllCoursesPage({ className: _className, slugs, initialData }: AllCoursesPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Query params are now only used for non-category filters (search, sort, etc.)

  // Check if we're using slug-based routing
  const isSlugBasedRoute = React.useMemo(() => {
    return slugs && slugs.length > 0;
  }, [slugs]);

  // Convert slugs to category slugs for API - used for slug-based routing
  // Supports multiple category slugs: /topics/cat1/cat2/cat3
  const categorySlugsFromRoute = React.useMemo(() => {
    if (!slugs || slugs.length === 0 || categories.length === 0) {
      return null;
    }

    // Return all slugs joined by comma for the API
    return slugs.join(",");
  }, [slugs, categories.length]);

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

  // Filters from URL (non-category filters only)
  const [selectedLevels, setSelectedLevels] = React.useState<SkillLevel[]>(
    (searchParams.get("levels")?.split(",").filter(Boolean) as SkillLevel[]) ||
      []
  );
  // Selected categories are managed via slug-based routing, not query params
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  
  // Get the category IDs from slugs for sidebar selection
  // Supports multiple category slugs with smart parent/subcategory handling
  const categoryIdsFromSlugs = React.useMemo(() => {
    if (!slugs || slugs.length === 0 || categories.length === 0) {
      return [];
    }

    // Step 1: Separate parent slugs from subcategory slugs
    const parentSlugs: string[] = [];
    const subcategorySlugs: string[] = [];

    slugs.forEach((slug) => {
      // Check if it's a parent category
      const isParent = categories.some((c) => c.slug === slug);
      if (isParent) {
        parentSlugs.push(slug);
        return;
      }

      // Check if it's a subcategory
      const isSubcategory = categories.some((parent) =>
        parent.subcategories.some((sub) => sub.slug === slug)
      );
      if (isSubcategory) {
        subcategorySlugs.push(slug);
      }
    });

    // Step 2: Determine which slugs to process
    // If there are ANY subcategory slugs, use ONLY subcategories (ignore parents)
    // If there are ONLY parent slugs, expand them to all their subcategories
    const categoryIds: string[] = [];

    if (subcategorySlugs.length > 0) {
      // Specific subcategories selected - use ONLY those, ignore parent slugs
      subcategorySlugs.forEach((slug) => {
        for (const parent of categories) {
          const subcategory = parent.subcategories.find((sub) => sub.slug === slug);
          if (subcategory) {
            categoryIds.push(subcategory.categoryId);
            break;
          }
        }
      });
    } else {
      // Only parent categories selected - expand to all subcategories
      parentSlugs.forEach((slug) => {
        const parentCategory = categories.find((c) => c.slug === slug);
        if (parentCategory) {
          if (parentCategory.subcategories.length > 0) {
            // Parent has subcategories - select all of them
            categoryIds.push(...parentCategory.subcategories.map((sub) => sub.categoryId));
          } else {
            // Parent has no subcategories - select the parent itself
            categoryIds.push(parentCategory.categoryId);
          }
        }
      });
    }

    return categoryIds;
  }, [slugs, categories]);

  // Initialize selectedCategories from slugs when using slug-based routing
  React.useEffect(() => {
    if (isSlugBasedRoute && categoryIdsFromSlugs.length > 0) {
      setSelectedCategories(categoryIdsFromSlugs);
    }
  }, [isSlugBasedRoute, categoryIdsFromSlugs]);

  // Query param routing is no longer supported for categories
  // All category filtering should use slug-based routing
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

  // Debounce search query - wait 500ms after user stops typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when filters change (non-category filters only)
  // Categories are handled via slug-based routing
  const updateURL = React.useCallback(
    (updates: Record<string, string | number | string[] | null>) => {
      const params = new URLSearchParams();

      // Build params object with all current values (excluding categories)
      const allParams = {
        query: debouncedSearchQuery,
        levels: selectedLevels,
        durations: selectedDurations,
        rating: minRating,
        sort: sortBy,
        page: currentPage,
        ...updates,
      };

      // Add params to URL (categories are NOT included - they're in the slug path)
      if (allParams.query) params.set("query", allParams.query as string);
      if (Array.isArray(allParams.levels) && allParams.levels.length > 0) {
        params.set("levels", allParams.levels.join(","));
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
      
      // If using slug-based routing, preserve the slug path
      if (isSlugBasedRoute && slugs) {
        const slugPath = `/topics/${slugs.join("/")}`;
        router.push(queryString ? `${slugPath}?${queryString}` : slugPath);
      } else {
        // Base /topics page (no categories selected)
        router.push(queryString ? `/topics?${queryString}` : "/topics");
      }
    },
    [
      debouncedSearchQuery,
      selectedLevels,
      selectedDurations,
      minRating,
      sortBy,
      currentPage,
      router,
      isSlugBasedRoute,
      slugs,
    ]
  );

  // Build search params for API using debounced search query
  const apiParams = React.useMemo((): SearchCoursesParams => {
    const [sortField, order] = sortBy.split("-") as [
      "created_at" | "title" | "published_at",
      "asc" | "desc",
    ];

    // Category filtering is always slug-based now
    const categorySlugParam = categorySlugsFromRoute || undefined;

    return {
      query: debouncedSearchQuery || undefined,
      categorySlug: categorySlugParam,
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
    selectedDurations,
    minRating,
    sortBy,
    currentPage,
    categorySlugsFromRoute,
  ]);

  // Determine if we should use initialData (only when no search/filters applied)
  const shouldUseInitialData = React.useMemo(() => {
    return (
      initialData &&
      !debouncedSearchQuery &&
      selectedLevels.length === 0 &&
      selectedDurations.length === 0 &&
      minRating === 0 &&
      sortBy === "created_at-desc" &&
      currentPage === 1
    );
  }, [
    initialData,
    debouncedSearchQuery,
    selectedLevels.length,
    selectedDurations.length,
    minRating,
    sortBy,
    currentPage,
  ]);

  // Use TanStack Query for data fetching
  // Refetch when category param changes
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", apiParams],
    queryFn: () => searchCourses(apiParams),
    initialData: shouldUseInitialData ? initialData : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false,
  });

  const courses = data?.data.courses || [];
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
   * - For slug-based routing: navigate to the category slug URL with multiple slugs
   */
  const handleCategoryToggle = React.useCallback(
    (categoryId: string, isParent: boolean) => {
      // Helper to convert category IDs to slugs
      const getCategorySlugs = (categoryIds: string[]): string[] => {
        return categoryIds
          .map((id) => {
            // Check if it's a parent category
            const parent = categories.find((c) => c.categoryId === id);
            if (parent) return parent.slug;

            // Check subcategories
            for (const cat of categories) {
              const subcategory = cat.subcategories.find((sub) => sub.categoryId === id);
              if (subcategory) return subcategory.slug;
            }
            return null;
          })
          .filter(Boolean) as string[];
      };

      // Calculate new categories (same logic for both routing types)
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

      // If using slug-based routing, navigate to the slug URL with multiple categories
      if (isSlugBasedRoute) {
        if (newCategories.length === 0) {
          // No categories selected - go back to /topics
          router.push("/topics");
          return;
        }

        // Convert category IDs to slugs and build URL
        const categorySlugs = getCategorySlugs(newCategories);
        if (categorySlugs.length > 0) {
          router.push(`/topics/${categorySlugs.join("/")}`);
        }
        return;
      }

      // Query param routing logic - not allowed anymore, redirect to slug-based
      // Convert to slug-based routing
      if (newCategories.length === 0) {
        router.push("/topics");
        return;
      }

      const categorySlugs = getCategorySlugs(newCategories);
      if (categorySlugs.length > 0) {
        router.push(`/topics/${categorySlugs.join("/")}`);
      }
    },
    [selectedCategories, categories, isSlugBasedRoute, router]
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
    
    // Clear all filters and go to base topics page
    router.push("/topics");
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

