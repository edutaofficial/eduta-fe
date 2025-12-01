"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CourseAccordionItem,
  CourseAccordionTrigger,
  CourseAccordionContent,
  CourseAccordion,
} from "@/components/ui/course-accordion";
import { PlusIcon } from "lucide-react";
import type { UploadedFile } from "@/components/Common";
import { TitleDescriptionFields } from "./TitleDescriptionFields";
import { LectureItem } from "./LectureItem";
import type { SectionFormData, LectureFormData } from "@/types/curriculum";

interface SectionItemProps {
  section: SectionFormData;
  sectionIndex: number;
  canRemove: boolean;
  showErrors: boolean;
  openLectures: string[];
  onOpenLecturesChange: (value: string[]) => void;
  onRemove: () => void;
  onUpdateSection: (field: keyof SectionFormData, value: string) => void;
  onAddLecture: () => void;
  onRemoveLecture: (lectureId: number | string) => void;
  onUpdateLecture: (
    lectureId: number | string,
    field: keyof LectureFormData,
    value: string | number | boolean | UploadedFile[]
  ) => void;
  onBatchUpdateLecture: (
    lectureId: number | string,
    updates: Partial<LectureFormData>
  ) => void;
  onLectureUploadStateChange: (
    lectureId: number | string,
    isUploading: boolean
  ) => void;
}

/**
 * Section Item Component
 * Represents a single section containing multiple lectures
 * Manages section metadata and lecture collection
 */
export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  sectionIndex,
  canRemove,
  showErrors,
  openLectures,
  onOpenLecturesChange,
  onRemove,
  onUpdateSection,
  onAddLecture,
  onRemoveLecture,
  onUpdateLecture,
  onBatchUpdateLecture,
  onLectureUploadStateChange,
}) => {
  return (
    <CourseAccordionItem
      key={section.id}
      value={`section-${section.id}`}
      className="mb-4"
    >
      <CourseAccordionTrigger
        variant="section"
        onClose={canRemove ? onRemove : undefined}
      >
        <span className="font-medium text-lg">
          Module {sectionIndex + 1}
          {section.name.trim() && (
            <>
              {" | "}
              {section.name}
            </>
          )}
        </span>
      </CourseAccordionTrigger>
      
      <CourseAccordionContent>
        <div className="p-6">
          {/* Section Title & Description */}
          <TitleDescriptionFields
            id={section.id}
            title={section.name}
            description={section.description}
            onTitleChange={(value) => onUpdateSection("name", value)}
            onDescriptionChange={(value) => onUpdateSection("description", value)}
            titleLabel="Module Name"
            descriptionLabel="Module Description"
            titlePlaceholder="Enter module name"
            descriptionPlaceholder="Describe what students will learn in this module..."
            showErrors={showErrors}
            variant="section"
          />

          {/* Lectures */}
          <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-medium">Lectures</h3>

            <CourseAccordion
              type="multiple"
              className="space-y-2"
              value={openLectures}
              onValueChange={onOpenLecturesChange}
            >
              {section.lectures.map((lecture, lectureIndex) => (
                <LectureItem
                  key={lecture.id}
                  lecture={lecture}
                  lectureIndex={lectureIndex}
                  canRemove={section.lectures.length > 1}
                  showErrors={showErrors}
                  onRemove={() => onRemoveLecture(lecture.id)}
                  onUpdate={(field, value) => onUpdateLecture(lecture.id, field, value)}
                  onBatchUpdate={(updates) => onBatchUpdateLecture(lecture.id, updates)}
                  onUploadStateChange={(isUploading) =>
                    onLectureUploadStateChange(lecture.id, isUploading)
                  }
                />
              ))}
            </CourseAccordion>

            {/* Add Lecture Button - At Bottom */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddLecture}
              className="w-full gap-2 border border-dashed border-primary-300 hover:border-primary-400 hover:bg-primary-50"
            >
              <PlusIcon className="size-4" />
              Add Lecture
            </Button>
          </div>
        </div>
      </CourseAccordionContent>
    </CourseAccordionItem>
  );
};

