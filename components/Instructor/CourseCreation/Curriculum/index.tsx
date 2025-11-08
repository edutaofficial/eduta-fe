"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CourseAccordion } from "@/components/ui/course-accordion";
import { PlusIcon, EyeIcon } from "lucide-react";
import { SectionItem } from "./SectionItem";
import { useCurriculumForm } from "@/hooks/useCurriculumForm";
import type { CurriculumHandle } from "./types";

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
  } = useCurriculumForm();

  // Expose validation method via ref
  React.useImperativeHandle(ref, () => ({
    validateAndFocus,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course Curriculum</h2>
          <p className="text-sm text-muted-foreground">
            Organize your course into sections and lectures
          </p>
        </div>
        <Button onClick={addSection} variant="outline" className="gap-2">
          <PlusIcon className="size-4" />
          Add Section
        </Button>
      </div>

      {/* Sections */}
      <CourseAccordion
        type="multiple"
        defaultValue={[`section-${sections[0]?.id}`]}
      >
        {sections.map((section, sectionIndex) => (
          <SectionItem
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            canRemove={sections.length > 1}
            showErrors={showErrors}
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
