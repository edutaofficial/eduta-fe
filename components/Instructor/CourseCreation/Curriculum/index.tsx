"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CourseAccordion } from "@/components/ui/course-accordion";
import { PlusIcon, EyeIcon } from "lucide-react";
import { SectionItem } from "./SectionItem";
import { useCurriculumForm } from "@/hooks/useCurriculumForm";
import type { CurriculumHandle } from "@/types/curriculum";

interface CurriculumProps {
  onPreview?: () => void;
}

/**
 * Main Curriculum Component
 * Enterprise-level course curriculum management
 *
 * Features:
 * - Modular component architecture
 * - Atomic state updates (prevents race conditions)
 * - Comprehensive validation with error focus
 * - Support for draft/edit/fresh course creation
 * - Automatic video duration extraction
 * - Multi-file resource uploads
 * - Real-time sync with Zustand store
 *
 * @example
 * ```tsx
 * const curriculumRef = useRef<CurriculumHandle>(null);
 *
 * <Curriculum ref={curriculumRef} onPreview={handlePreview} />
 *
 * // Validate before proceeding
 * const isValid = await curriculumRef.current?.validateAndFocus();
 * ```
 */
const CurriculumInner = (
  { onPreview }: CurriculumProps,
  ref: React.Ref<CurriculumHandle>
) => {
  const {
    // State
    sections,
    showErrors,

    // Section actions
    addSection,
    removeSection,
    updateSection,

    // Lecture actions
    addLecture,
    removeLecture,
    updateLecture,
    updateMultipleLectureFields,
    handleLectureUploadStateChange,

    // Validation
    validateAndFocus,
    getFirstInvalidIds,
  } = useCurriculumForm();

  // Track which accordion items should be open
  const [openSections, setOpenSections] = React.useState<string[]>([]);
  const [openLectures, setOpenLectures] = React.useState<string[]>([]);

  // Initialize accordion state - only run once on mount
  const isInitializedRef = React.useRef(false);
  React.useEffect(() => {
    if (!isInitializedRef.current && sections.length > 0) {
      isInitializedRef.current = true;
      // Open first section and first lecture on initial render
      const firstSectionKey = `section-${sections[0].id}`;
      const firstLectureKey = sections[0].lectures[0] 
        ? `lecture-${sections[0].lectures[0].id}`
        : "";
      
      setOpenSections([firstSectionKey]);
      if (firstLectureKey) {
        setOpenLectures([firstLectureKey]);
      }
    }
  }, [sections]);

  // Enhanced validation that expands accordions
  const validateAndFocusWithExpand = React.useCallback(async (): Promise<boolean> => {
    const isValid = await validateAndFocus();
    
    if (!isValid) {
      // Get the first invalid field location
      const { sectionId, lectureId, fieldId } = getFirstInvalidIds();
      
      if (sectionId !== null) {
        const sectionKey = `section-${sectionId}`;
        
        // Open the section with the error
        if (!openSections.includes(sectionKey)) {
          setOpenSections((prev) => [...prev, sectionKey]);
        }
        
        // If error is in a lecture, open that lecture too
        if (lectureId !== null) {
          const lectureKey = `lecture-${lectureId}`;
          if (!openLectures.includes(lectureKey)) {
            setOpenLectures((prev) => [...prev, lectureKey]);
          }
          
          // Scroll to the field after accordion animation
          setTimeout(() => {
            const element = document.getElementById(fieldId || "");
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 400); // Wait for accordion animation
        } else {
          // Error is in section fields, scroll immediately
          setTimeout(() => {
            const element = document.getElementById(fieldId || "");
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 400);
        }
      }
    }
    
    return isValid;
  }, [validateAndFocus, getFirstInvalidIds, openSections, openLectures]);

  // Expose validation method via ref
  React.useImperativeHandle(ref, () => ({
    validateAndFocus: validateAndFocusWithExpand,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Course Curriculum</h2>
        <p className="text-sm text-muted-foreground">
          Organize your course into sections and lectures
        </p>
      </div>

      {/* Sections */}
      <CourseAccordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
      >
        {sections.map((section, sectionIndex) => (
          <SectionItem
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            canRemove={sections.length > 1}
            showErrors={showErrors}
            openLectures={openLectures}
            onOpenLecturesChange={setOpenLectures}
            onRemove={() => removeSection(section.id)}
            onUpdateSection={(field, value) =>
              updateSection(section.id, field, value)
            }
            onAddLecture={() => addLecture(section.id)}
            onRemoveLecture={(lectureId) =>
              removeLecture(section.id, lectureId)
            }
            onUpdateLecture={(lectureId, field, value) =>
              updateLecture(section.id, lectureId, field, value)
            }
            onBatchUpdateLecture={(lectureId, updates) =>
              updateMultipleLectureFields(section.id, lectureId, updates)
            }
            onLectureUploadStateChange={(lectureId, isUploading) =>
              handleLectureUploadStateChange(section.id, lectureId, isUploading)
            }
          />
        ))}
      </CourseAccordion>

      {/* Add Section Button - At Bottom */}
      <Button
        type="button"
        onClick={addSection}
        variant="outline"
        className="w-full gap-2"
      >
        <PlusIcon className="size-4" />
        Add Module
      </Button>

      {/* Preview Button */}
      {onPreview && (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPreview}
            className="w-full gap-2"
          >
            <EyeIcon className="size-4" />
            Preview Course
          </Button>
        </div>
      )}
    </div>
  );
};

export const Curriculum = React.forwardRef<CurriculumHandle, CurriculumProps>(
  CurriculumInner
);

// Export types for external use
export type { CurriculumHandle, CurriculumProps };
