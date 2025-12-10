"use client";

import { ChevronDownIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useEffect } from "react";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface CoursesFiltersProps {
  selectedLevels: SkillLevel[];
  selectedCategories: string[];
  selectedDurations: string[];
  minRating: number;
  onLevelToggle: (level: SkillLevel) => void;
  onCategoryToggle: (categoryId: string, isParent: boolean) => void;
  onDurationToggle: (duration: string) => void;
  onRatingChange: (rating: number) => void;
  onClearAll: () => void;
}

export function CoursesFilters({
  selectedLevels,
  selectedCategories,
  selectedDurations,
  minRating,
  onLevelToggle,
  onCategoryToggle,
  onDurationToggle,
  onRatingChange,
  onClearAll,
}: CoursesFiltersProps) {
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();
  
  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const hasActiveFilters =
    selectedLevels.length > 0 ||
    selectedCategories.length > 0 ||
    selectedDurations.length > 0 ||
    minRating > 0;

  const categoriesWithSub = categories.filter((c) => c.subcategories.length > 0);
  const categoriesWithoutSub = categories.filter((c) => c.subcategories.length === 0);

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-default-200 p-4 space-y-1 sticky top-28">
        <h2 className="font-semibold text-lg mb-4 text-default-900">Filters</h2>

        <div className="space-y-1">
          {/* Skill Level Filter */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:text-primary-600 transition-colors">
              <span className="font-medium text-default-900">Skill Level</span>
              <ChevronDownIcon className="size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-4 pt-2 space-y-3">
              {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map(
                (level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={() => onLevelToggle(level)}
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {level}
                    </Label>
                  </div>
                )
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Categories Filter (with subcategories) */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:text-primary-600 transition-colors">
              <span className="font-medium text-default-900">Categories</span>
              <ChevronDownIcon className="size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-4 pt-2 space-y-4">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-full bg-default-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <>
                  {categoriesWithSub.map((category) => (
                    <div key={category.categoryId} className="space-y-2">
                      {/* Parent heading (not selectable) */}
                      <div className="text-sm font-semibold text-default-900">
                        {category.name}
                      </div>
                      <div className="space-y-2 pl-6">
                        {category.subcategories.map((subcategory) => (
                          <div
                            key={subcategory.categoryId}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${subcategory.categoryId}`}
                              checked={selectedCategories.includes(subcategory.categoryId)}
                              onCheckedChange={() => onCategoryToggle(subcategory.categoryId, false)}
                            />
                            <Label
                              htmlFor={`category-${subcategory.categoryId}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {subcategory.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {categoriesWithoutSub.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-default-900">Others</div>
                      <div className="space-y-2 pl-6">
                        {categoriesWithoutSub.map((category) => (
                          <div key={category.categoryId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.categoryId}`}
                              checked={selectedCategories.includes(category.categoryId)}
                              onCheckedChange={() => onCategoryToggle(category.categoryId, true)}
                            />
                            <Label
                              htmlFor={`category-${category.categoryId}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Duration Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:text-primary-600 transition-colors">
              <span className="font-medium text-default-900">Duration</span>
              <ChevronDownIcon className="size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-4 pt-2 space-y-3">
              {[
                { value: "0-5", label: "0-5 hours" },
                { value: "6-10", label: "6-10 hours" },
                { value: "11-15", label: "11-15 hours" },
                { value: "16+", label: "16+ hours" },
              ].map((duration) => (
                <div
                  key={duration.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`duration-${duration.value}`}
                    checked={selectedDurations.includes(duration.value)}
                    onCheckedChange={() => onDurationToggle(duration.value)}
                  />
                  <Label
                    htmlFor={`duration-${duration.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {duration.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Rating Filter */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:text-primary-600 transition-colors">
              <span className="font-medium text-default-900">Rating</span>
              <ChevronDownIcon className="size-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-4 pt-2 space-y-3">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <div
                  key={rating}
                  role="button"
                  tabIndex={0}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => onRatingChange(rating === minRating ? 0 : rating)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRatingChange(rating === minRating ? 0 : rating);
                    }
                  }}
                >
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={minRating === rating}
                  />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-1"
                  >
                    <StarIcon className="size-4 fill-warning-300 text-warning-300" />
                    {rating}+ and above
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full mt-4"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </aside>
  );
}

