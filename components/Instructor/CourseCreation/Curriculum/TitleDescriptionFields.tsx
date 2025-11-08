"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { TitleDescriptionFieldsProps } from "./types";

/**
 * Reusable component for title and description fields
 * Used by both Section and Lecture components
 */
export const TitleDescriptionFields: React.FC<TitleDescriptionFieldsProps> = ({
  id,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  titleLabel,
  descriptionLabel,
  titlePlaceholder,
  descriptionPlaceholder,
  showErrors,
  variant,
}) => {
  const titleId = `${variant}-name-${id}`;
  const descId = `${variant}-desc-${id}`;

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Title Field */}
      <div className="space-y-2">
        <Label>
          {titleLabel} <span className="text-destructive">*</span>
        </Label>
        <Input
          id={titleId}
          placeholder={titlePlaceholder}
          value={title}
          className="bg-white"
          onChange={(e) => onTitleChange(e.target.value)}
          aria-invalid={showErrors && !title.trim()}
        />
        {showErrors && !title.trim() && (
          <p className="text-sm text-destructive mt-1">
            {titleLabel} is required
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label>
          {descriptionLabel} <span className="text-destructive">*</span>
        </Label>
        <div id={descId}>
          <RichTextEditor
            className="bg-white"
            value={description}
            onChange={onDescriptionChange}
            placeholder={descriptionPlaceholder}
            maxLength={2500}
          />
        </div>
        {showErrors && !description.trim() && (
          <p className="text-sm text-destructive mt-1">
            {descriptionLabel} is required
          </p>
        )}
      </div>
    </div>
  );
};

