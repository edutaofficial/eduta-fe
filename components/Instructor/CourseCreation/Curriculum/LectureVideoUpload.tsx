"use client";

import * as React from "react";
import { UploadFile } from "@/components/Common";
import type { LectureVideoUploadProps } from "./types";

/**
 * Component for uploading lecture videos
 * Handles:
 * - Video file upload
 * - Upload state management
 * - Error display
 *
 * Note: Duration extraction is handled by the parent component (LectureItem)
 */
export const LectureVideoUpload: React.FC<LectureVideoUploadProps> = ({
  lectureId,
  videoId,
  duration,
  onVideoChange,
  onUploadStateChange,
  showErrors,
}) => {
  const handleVideoChange = React.useCallback(
    async (assetId: number | null, file?: File) => {
      onVideoChange(assetId, file);
    },
    [onVideoChange]
  );

  return (
    <div className="space-y-2" id={`lecture-video-${lectureId}`}>
      <UploadFile
        label="Lecture Video"
        accept="video/*"
        value={videoId || null}
        onChange={handleVideoChange}
        onUploadStateChange={onUploadStateChange}
        error={
          showErrors && (!videoId || videoId === 0)
            ? "Lecture video is required"
            : undefined
        }
      />

      {/* Duration Display */}
      {duration && duration > 0 && (
        <p className="text-xs text-muted-foreground">
          Duration: {duration} {duration === 1 ? "minute" : "minutes"}
        </p>
      )}
    </div>
  );
};
