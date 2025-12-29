"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  CourseAccordionItem,
  CourseAccordionTrigger,
  CourseAccordionContent,
} from "@/components/ui/course-accordion";
import { getVideoDuration, secondsToMinutes } from "@/lib/videoUtils";
import type { UploadedFile } from "@/components/Common";
import { TitleDescriptionFields } from "./TitleDescriptionFields";
import { LectureVideoUpload } from "./LectureVideoUpload";
import { LectureResourcesUpload } from "./LectureResourcesUpload";
import type { LectureFormData } from "@/types/curriculum";

interface LectureItemProps {
  lecture: LectureFormData;
  lectureIndex: number;
  canRemove: boolean;
  showErrors: boolean;
  onRemove: () => void;
  onUpdate: (
    field: keyof LectureFormData,
    value: string | number | boolean | UploadedFile[]
  ) => void;
  onBatchUpdate: (updates: Partial<LectureFormData>) => void;
  onUploadStateChange: (isUploading: boolean) => void;
}

/**
 * Lecture Item Component
 * Represents a single lecture within a section
 * Handles video upload, resources, and lecture-specific metadata
 */
export const LectureItem: React.FC<LectureItemProps> = ({
  lecture,
  lectureIndex,
  canRemove,
  showErrors,
  onRemove,
  onUpdate,
  onBatchUpdate,
  onUploadStateChange,
}) => {
  const handleVideoChange = React.useCallback(
    async (assetId: number | null, file?: File) => {
      if (!assetId) {
        // Video was removed - reset both video and duration
        onBatchUpdate({
          video: 0,
          duration: 0,
        });
        return;
      }

      // Set video and default duration atomically
      onBatchUpdate({
        video: assetId,
        duration: 1, // Default 1 minute
      });

      // Extract actual duration from file
      if (file) {
        try {
          const durationInSeconds = await getVideoDuration(file);
          const durationInMinutes = secondsToMinutes(durationInSeconds);

          // Update with actual duration using batch update only
          onBatchUpdate({
            video: assetId,
            duration: durationInMinutes,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Failed to extract video duration:", error);
          // Keep default 1 minute
        }
      }
    },
    [onBatchUpdate]
  );

  return (
    <CourseAccordionItem
      key={lecture.id}
      value={`lecture-${lecture.id}`}
      className="mb-2"
      variant="lecture"
    >
      <CourseAccordionTrigger
        variant="lecture"
        onClose={canRemove ? onRemove : undefined}
      >
        <span className="text-sm">
          Lecture {lectureIndex + 1}
          {lecture.name.trim() && (
            <>
              {" | "}
              {lecture.name}
            </>
          )}
        </span>
      </CourseAccordionTrigger>

      <CourseAccordionContent>
        <div className="space-y-4 p-6">
          {/* Title & Description */}
          <TitleDescriptionFields
            id={lecture.id}
            title={lecture.name}
            description={lecture.description}
            onTitleChange={(value) => onUpdate("name", value)}
            onDescriptionChange={(value) => onUpdate("description", value)}
            titleLabel="Lecture Name"
            descriptionLabel="Lecture Description"
            titlePlaceholder="Enter lecture name"
            descriptionPlaceholder="Describe this lecture..."
            showErrors={showErrors}
            variant="lecture"
          />

          {/* Video Upload */}
          <LectureVideoUpload
            lectureId={lecture.id}
            videoId={lecture.video}
            duration={lecture.duration}
            onVideoChange={handleVideoChange}
            onUploadStateChange={onUploadStateChange}
            showErrors={showErrors}
          />

          {/* Resources Upload */}
          <LectureResourcesUpload
            resources={lecture.resources}
            onChange={(files) => onUpdate("resources", files)}
          />

          {/* Preview Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`lecture-preview-${lecture.id}`}
                checked={lecture.isPreview ?? false}
                onChange={(e) => onUpdate("isPreview", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label
                htmlFor={`lecture-preview-${lecture.id}`}
                className="cursor-pointer"
              >
                Allow preview (free)
              </Label>
            </div>
          </div>
        </div>
      </CourseAccordionContent>
    </CourseAccordionItem>
  );
};
