"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
}

export function AllCoursesPage({ className: _className, slugs }: AllCoursesPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { categories, fetchCategories } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Get current URL params as strings for dependency tracking
  // Use toString() to ensure we detect URL changes properly
  const categoryParamFromUrl = searchParams.get("category");
  const searchParamsString = searchParams.toString(); // This changes when URL changes

  // Check if we're using slug-based routing
  const isSlugBasedRoute = React.useMemo(() => {
    return slugs && slugs.length > 0;
  }, [slugs]);

  // Helper function to find category/subcategory by slug
  const _findCategoryBySlug = React.useCallback((slug: string) => {
    // First check if it's a parent category
    const parentCategory = categories.find((c) => c.slug === slug);
    if (parentCategory) {
      return { category: parentCategory, isParent: true };
    }

    // Then check subcategories
    for (const parent of categories) {
      const subcategory = parent.subcategories.find((sub) => sub.slug === slug);
      if (subcategory) {
        return { category: subcategory, parent, isParent: false };
      }
    }

    return null;
  }, [categories]);

  // Convert slugs to category slugs for API - used for slug-based routing
  const categorySlugsFromRoute = React.useMemo(() => {
    if (!slugs || slugs.length === 0 || categories.length === 0) {
      return null;
    }

    const [categorySlug, subcategorySlug] = slugs;

    // If we have a subcategory slug and it's different from category slug
    if (subcategorySlug && subcategorySlug !== categorySlug) {
      // It's a subcategory - just use the subcategory slug
      return subcategorySlug;
    }

    // Otherwise use the category slug
    return categorySlug;
  }, [slugs, categories.length]);

  // Get the category IDs from slugs for sidebar selection
  const categoryIdsFromSlugs = React.useMemo(() => {
    if (!slugs || slugs.length === 0 || categories.length === 0) {
      return [];
    }

    const [categorySlug, subcategorySlug] = slugs;

    // If we have a subcategory slug and it's different from category slug
    if (subcategorySlug && subcategorySlug !== categorySlug) {
      // Find the subcategory
      for (const parent of categories) {
        const subcategory = parent.subcategories.find((sub) => sub.slug === subcategorySlug);
        if (subcategory) {
          return [subcategory.categoryId];
        }
      }
    }

    // Otherwise find the category
    const category = categories.find((c) => c.slug === categorySlug);
    if (category) {
      // If category has subcategories, select all of them
      if (category.subcategories.length > 0) {
        return category.subcategories.map((sub) => sub.categoryId);
      }
      // Otherwise select the category itself
      return [category.categoryId];
    }

    return [];
  }, [slugs, categories]);

  // Initialize selectedCategories from slugs when using slug-based routing
  React.useEffect(() => {
    if (isSlugBasedRoute && categoryIdsFromSlugs.length > 0) {
      setSelectedCategories(categoryIdsFromSlugs);
    }
  }, [isSlugBasedRoute, categoryIdsFromSlugs]);

  // Only handle old query param routing if NOT using slug-based routing
  // Handle "category" param from URL (from breadcrumb) - convert to "categories" with all subcategories
  React.useEffect(() => {
    // Skip if using slug-based routing
    if (isSlugBasedRoute) {
      return;
    }

    // Only process if category param exists and categories are loaded
    if (!categoryParamFromUrl || categories.length === 0) {
      return;
    }
    
    // Find the category in the categories list
    const category = categories.find((c) => c.categoryId === categoryParamFromUrl);
    
    if (!category) {
      return;
    }
    
    const hasSubcategories = category.subcategories.length > 0;
    let newCategories: string[] = [];
    
    if (hasSubcategories) {
      // If category has subcategories, select all subcategories (not the parent)
      const allSubcategoryIds = category.subcategories.map((sub) => sub.categoryId);
      newCategories = allSubcategoryIds;
    } else {
      // If category has no subcategories, select the category itself
      newCategories = [categoryParamFromUrl];
    }
    
    // Update URL to use "categories" param instead of "category"
    // The sync effect below will update state and trigger refetch
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    if (newCategories.length > 0) {
      params.set("categories", newCategories.join(","));
    }
    const newUrl = params.toString() ? `/topics?${params.toString()}` : "/topics";
    router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParamFromUrl, categories.length, isSlugBasedRoute]);

  // Sync selectedCategories with "categories" URL param - this is the single source of truth
  // This effect runs whenever the URL changes (including external navigation)
  // Only for query-param based routing, not slug-based routing
  React.useEffect(() => {
    // Skip if using slug-based routing
    if (isSlugBasedRoute) {
      return;
    }

    // Read params directly from searchParams inside effect to ensure we get latest values
    const categoryParam = searchParams.get("category");
    const categoriesParam = searchParams.get("categories");
    
    // If category param exists, let the conversion effect handle it first
    if (categoryParam) {
      return;
    }
    
    const urlCategories = categoriesParam
      ? categoriesParam.split(",").filter(Boolean)
      : [];
    
    // Always sync from URL - URL is the source of truth
    // Compare as strings to ensure we catch all changes
    const currentSorted = [...selectedCategories].sort().join(",");
    const urlSorted = [...urlCategories].sort().join(",");
    
    if (currentSorted !== urlSorted) {
      // Update state - this will trigger query refetch via apiParams dependency
      setSelectedCategories(urlCategories);
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString, pathname, searchParams, isSlugBasedRoute]); // Watch searchParamsString, pathname, and searchParams to detect any URL changes

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

  // Filters from URL - categories will be synced via useEffect below
  const [selectedLevels, setSelectedLevels] = React.useState<SkillLevel[]>(
    (searchParams.get("levels")?.split(",").filter(Boolean) as SkillLevel[]) ||
      []
  );
  // Initialize from URL, then sync effect will keep it updated
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(() => {
    const categoriesParam = searchParams.get("categories");
    return categoriesParam ? categoriesParam.split(",").filter(Boolean) : [];
  });
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

      // Add params to URL (but NOT categories for slug-based routing)
      if (allParams.query) params.set("query", allParams.query as string);
      if (Array.isArray(allParams.levels) && allParams.levels.length > 0) {
        params.set("levels", allParams.levels.join(","));
      }
      // Only add categories param if NOT using slug-based routing
      if (
        !isSlugBasedRoute &&
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
      
      // If using slug-based routing, preserve the slug path
      if (isSlugBasedRoute && slugs) {
        const slugPath = `/topics/${slugs.join("/")}`;
        router.push(queryString ? `${slugPath}?${queryString}` : slugPath);
      } else {
        // Otherwise use query param routing
        router.push(queryString ? `/topics?${queryString}` : "/topics");
      }
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

    // If we have category slugs from route, use those (slug-based routing)
    // Otherwise use optimized category IDs from filters (query param routing)
    let categoryParam: string | undefined;
    let categorySlugParam: string | undefined;

    if (categorySlugsFromRoute) {
      // Slug-based routing - use categorySlug param
      categorySlugParam = categorySlugsFromRoute;
    } else {
      // Query param routing - optimize category selection
      const optimizedCategoryIds = getOptimizedCategoryIds(
        selectedCategories,
        categories
      );
      
      if (optimizedCategoryIds.length > 0) {
        // Convert IDs to slugs for SEO-friendly API calls
        const slugs = optimizedCategoryIds
          .map((id) => {
            const parent = categories.find((c) => c.categoryId === id);
            if (parent) return parent.slug;
            
            // Check subcategories
            for (const cat of categories) {
              const sub = cat.subcategories.find((s) => s.categoryId === id);
              if (sub) return sub.slug;
            }
            return null;
          })
          .filter(Boolean) as string[];
        
        categorySlugParam = slugs.length > 0 ? slugs.join(",") : undefined;
      }
    }

    return {
      query: debouncedSearchQuery || undefined,
      categoryId: categoryParam,
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
    selectedCategories,
    selectedDurations,
    minRating,
    sortBy,
    currentPage,
    categories,
    getOptimizedCategoryIds,
    categorySlugsFromRoute,
  ]);

  // Use TanStack Query for data fetching
  // Refetch when category param changes
  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", apiParams],
    queryFn: () => searchCourses(apiParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
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
   * - For slug-based routing: navigate to the category slug URL
   */
  const handleCategoryToggle = React.useCallback(
    (categoryId: string, isParent: boolean) => {
      // If using slug-based routing, navigate to the category URL directly
      if (isSlugBasedRoute) {
        const parent = categories.find((c) => c.categoryId === categoryId);
        if (parent) {
          // Navigate to the parent category slug
          router.push(`/topics/${parent.slug}/${parent.slug}`);
          return;
        }

        // If it's a subcategory, find its parent and navigate
        for (const cat of categories) {
          const subcategory = cat.subcategories.find((sub) => sub.categoryId === categoryId);
          if (subcategory) {
            router.push(`/topics/${cat.slug}/${subcategory.slug}`);
            return;
          }
        }
        return;
      }

      // Query param routing logic (existing logic)
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

      // Update URL - the sync effect will update selectedCategories state
      // This ensures URL is the single source of truth
      setCurrentPage(1);
      updateURL({ categories: newCategories, page: 1 });
    },
    [selectedCategories, categories, updateURL, isSlugBasedRoute, router]
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
    setSelectedDurations([]);
    setMinRating(0);
    setCurrentPage(1);
    
    // If using slug-based routing, preserve the slug path but clear other filters
    if (isSlugBasedRoute && slugs) {
      const slugPath = `/topics/${slugs.join("/")}`;
      router.push(slugPath);
    } else {
      // Otherwise clear everything and go to base topics page
      router.push("/topics");
    }
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
