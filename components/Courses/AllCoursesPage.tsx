"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CoursesSearchBar } from "./CoursesSearchBar";
import { CoursesFilters, type SkillLevel } from "./CoursesFilters";
import { CoursesGrid, type SortOption } from "./CoursesGrid";
import {
  searchCourses,
  type SearchCoursesParams,
} from "@/app/api/course/searchCourses";
import type { PublicCourse } from "@/types/course";

interface AllCoursesPageProps {
  className?: string;
}

export function AllCoursesPage({ className: _className }: AllCoursesPageProps) {
  // State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("created_at-desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [selectedLevels, setSelectedLevels] = React.useState<SkillLevel[]>([]);
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = React.useState<string[]>(
    []
  );
  const [minRating, setMinRating] = React.useState<number>(0);

  // API Data
  const [courses, setCourses] = React.useState<PublicCourse[]>([]);
  const [meta, setMeta] = React.useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 9,
    hasNext: false,
    hasPrevious: false,
  });

  const itemsPerPage = 9;

  // Fetch courses from API
  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parse sort option
      const [sortField, order] = sortBy.split("-") as [
        "created_at" | "title" | "published_at",
        "asc" | "desc",
      ];

      // Build API params
      const params: SearchCoursesParams = {
        query: searchQuery || undefined,
        categoryId:
          selectedDomains.length === 1 ? selectedDomains[0] : undefined,
        learningLevel:
          selectedLevels.length === 1 ? selectedLevels[0] : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy: sortField,
        order,
        page: currentPage,
        pageSize: itemsPerPage,
      };

      const response = await searchCourses(params);

      setCourses(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedLevels,
    selectedDomains,
    minRating,
    sortBy,
    currentPage,
    itemsPerPage,
  ]);

  // Fetch courses on mount and when dependencies change
  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLevels, selectedDomains, selectedDurations, minRating, sortBy]);

  // Filter handlers
  const handleLevelToggle = (level: SkillLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const handleDurationToggle = (duration: string) => {
    setSelectedDurations((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration]
    );
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
  };

  const handleClearFilters = () => {
    setSelectedLevels([]);
    setSelectedDomains([]);
    setSelectedDurations([]);
    setMinRating(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            {error}
          </div>
        )}

        {/* Main Content: Filters + Courses Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          <CoursesFilters
            selectedLevels={selectedLevels}
            selectedDomains={selectedDomains}
            selectedDurations={selectedDurations}
            minRating={minRating}
            onLevelToggle={handleLevelToggle}
            onDomainToggle={handleDomainToggle}
            onDurationToggle={handleDurationToggle}
            onRatingChange={handleRatingChange}
            onClearAll={handleClearFilters}
          />

          <CoursesGrid
            courses={courses}
            loading={loading}
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
