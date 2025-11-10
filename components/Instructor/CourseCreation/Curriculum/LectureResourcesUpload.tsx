"use client";

import * as React from "react";
import { UploadMultipleFiles } from "@/components/Common";
import type { LectureResourcesUploadProps } from "@/types/curriculum";

/**
 * Component for uploading lecture resources (PDFs, docs, etc.)
 * Handles multiple file uploads with drag-and-drop support
 */
export const LectureResourcesUpload: React.FC<LectureResourcesUploadProps> = ({
  resources,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <UploadMultipleFiles
        label="Resources (Optional)"
        accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.txt"
        value={Array.isArray(resources) ? resources : []}
        onChange={onChange}
        hint="Upload PDF, DOC, ZIP files"
        maxFiles={5}
      />
    </div>
  );
};
