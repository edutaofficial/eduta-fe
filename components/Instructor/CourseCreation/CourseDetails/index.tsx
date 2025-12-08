/**
 * Course Details Main Component
 * Handles data orchestration, prefilling for editing/drafts, and business logic
 * Delegates presentation and validation to CourseDetailForm
 */

"use client";

import * as React from "react";
import { truncateHtmlByWords } from "@/lib/textUtils";
import { useCourseStore } from "@/store/useCourseStore";
import { CourseDetailForm } from "./CourseDetailForm";
import type { CourseDetailsFormValues, CourseDetailsHandle } from "@/types/courseDetails";

export interface CourseDetailsProps {
  onPreview?: () => void;
}

/**
 * Normalize learning level to capitalized format
 */
const normalizeLearningLevel = (level: string): string => {
  if (!level) return "";
  const lower = level.toLowerCase();
  if (lower === "beginner") return "Beginner";
  if (lower === "intermediate") return "Intermediate";
  if (lower === "advanced") return "Advanced";
  if (lower === "expert") return "Expert";
  return level;
};

/**
 * Main CourseDetails component
 * Manages data flow between store and form
 */
const CourseDetailsInner = (
  { onPreview }: CourseDetailsProps,
  ref: React.Ref<CourseDetailsHandle>
) => {
  const { basicInfo, setBasicInfo, loading } = useCourseStore();
  const formRef = React.useRef<CourseDetailsHandle>(null);

  const clampShortDescription = React.useCallback((value: string | undefined) => {
    return (value || "").slice(0, 500);
  }, []);

  const clampFullDescription = React.useCallback((value: string | undefined) => {
    return truncateHtmlByWords(value || "", 3000);
  }, []);

  // Prepare initial values from store (handles prefilling for editing/drafts)
  const initialValues = React.useMemo<CourseDetailsFormValues>(() => {
    return {
      courseTitle: basicInfo.title || "",
      selectedCategory: basicInfo.categoryId || "",
      learningLevel: normalizeLearningLevel(basicInfo.learningLevel || ""),
      shortDescription: clampShortDescription(basicInfo.shortDescription),
      fullDescription: clampFullDescription(basicInfo.fullDescription),
      learningPoints:
        basicInfo.learningPoints.length > 0
          ? basicInfo.learningPoints.map((lp, idx) => ({
              id: idx + 1,
              text: lp.description,
            }))
          : [
              { id: 1, text: "" },
              { id: 2, text: "" },
              { id: 3, text: "" },
              { id: 4, text: "" },
            ],
      promoVideoId: basicInfo.promoVideoId || null,
      courseBannerId: basicInfo.courseBannerId || null,
    };
  }, [basicInfo, clampFullDescription, clampShortDescription]);

  // Handle form submission - sync data to store
  const handleSubmit = React.useCallback(
    (values: CourseDetailsFormValues) => {
      const safeShortDescription = clampShortDescription(values.shortDescription);
      const safeFullDescription = clampFullDescription(values.fullDescription);

      const learningPoints = values.learningPoints.map((lp) => ({
        description: lp.text,
      }));

      setBasicInfo({
        title: values.courseTitle,
        categoryId: values.selectedCategory,
        learningLevel: values.learningLevel,
        description: safeShortDescription,
        shortDescription: safeShortDescription,
        fullDescription: safeFullDescription,
        language: "English",
        learningPoints,
        requirements: [],
        targetAudience: [],
        tags: [],
        promoVideoId: values.promoVideoId,
        courseBannerId: values.courseBannerId,
      });
    },
    [clampFullDescription, clampShortDescription, setBasicInfo]
  );

  // Note: Removed auto-sync useEffect as it was causing data loss
  // Data is now only synced via handleSubmit when form is submitted

  // Expose validation method to parent (CourseCreationWizard)
  React.useImperativeHandle(
    ref,
    () => ({
      validateAndFocus: async () => {
        if (formRef.current) {
          return formRef.current.validateAndFocus();
        }
        return false;
      },
      getValues: () => {
        if (formRef.current) {
          return formRef.current.getValues();
        }
        return initialValues;
      },
    }),
    [initialValues]
  );

  return (
    <div className="w-full">
      <CourseDetailForm
        ref={formRef}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onPreview={onPreview}
        isSubmitting={loading.createCourse}
      />
    </div>
  );
};

export const CourseDetails = React.forwardRef<
  CourseDetailsHandle,
  CourseDetailsProps
>(CourseDetailsInner);

// Re-export types for convenience
export type { CourseDetailsHandle } from "@/types/courseDetails";

