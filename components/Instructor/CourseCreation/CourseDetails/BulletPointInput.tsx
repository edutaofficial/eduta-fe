/**
 * Reusable Bullet Point Input Component
 * Used for learning points, requirements, and target audience
 */

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulletPoint {
  id: number;
  text: string;
}

interface BulletPointInputProps {
  label: string;
  description: string;
  value: BulletPoint[];
  onChange: (points: BulletPoint[]) => void;
  onBlur?: (index: number) => void;
  error?: string | Array<{ text?: string }>;
  touched?: boolean | Array<{ text?: boolean }>;
  minItems?: number;
  maxItems?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function BulletPointInput({
  label,
  description,
  value,
  onChange,
  onBlur,
  error,
  touched,
  minItems = 2,
  maxItems = 10,
  maxLength = 120,
  placeholder = "Enter a point",
  disabled = false,
  required = false,
}: BulletPointInputProps) {
  const handleAdd = React.useCallback(() => {
    const newPoints = [...value, { id: Date.now(), text: "" }];
    onChange(newPoints);
  }, [value, onChange]);

  const handleRemove = React.useCallback(
    (id: number) => {
      if (value.length > minItems) {
        const newPoints = value.filter((p) => p.id !== id);
        onChange(newPoints);
      }
    },
    [value, minItems, onChange]
  );

  const handleChange = React.useCallback(
    (index: number, text: string) => {
      const newPoints = [...value];
      newPoints[index] = { ...newPoints[index], text };
      onChange(newPoints);
    },
    [value, onChange]
  );

  const hasArrayError = typeof error === "string";
  const errorArray = Array.isArray(error) ? error : [];

  return (
    <div className="space-y-4">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <p
        className={cn(
          "text-xs font-medium",
          hasArrayError && touched
            ? "text-destructive"
            : "text-muted-foreground"
        )}
      >
        {description}
      </p>

      <div
        className={cn(
          "rounded-lg border-2 p-4 transition-all duration-200",
          hasArrayError && touched ? "border-destructive" : "border-none"
        )}
      >
        <div className="space-y-3">
          {value.map((point, index) => (
            <div key={point.id} className="flex items-start gap-3">
              <span className="mt-2.5 text-sm font-medium text-muted-foreground">
                {index + 1}.
              </span>
              <div className="flex-1">
                <Textarea
                  placeholder={`${placeholder} (max ${maxLength} characters)`}
                  value={point.text}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onBlur={() => onBlur?.(index)}
                  maxLength={maxLength}
                  rows={1}
                  disabled={disabled}
                  className={cn(
                    "resize-none",
                    Array.isArray(touched) &&
                      touched[index]?.text &&
                      errorArray[index]?.text
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  )}
                  aria-invalid={
                    !!(
                      Array.isArray(touched) &&
                      touched[index]?.text &&
                      errorArray[index]?.text
                    )
                  }
                />
                {Array.isArray(touched) &&
                  touched[index]?.text &&
                  errorArray[index]?.text && (
                    <p className="text-sm text-destructive font-medium mt-1">
                      {errorArray[index].text}
                    </p>
                  )}
              </div>
              {value.length > minItems && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(point.id)}
                  disabled={disabled}
                  className="mt-1.5 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                >
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Array-level error */}
      {hasArrayError && touched && (
        <div className="bg-destructive/10 border border-destructive rounded-md p-3 -mt-2">
          <p className="text-sm text-destructive font-semibold">
            ⚠️ {String(error)}
          </p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleAdd}
        disabled={value.length >= maxItems || disabled}
        className="gap-2"
      >
        <PlusIcon className="size-4" />
        Add {label}
      </Button>
    </div>
  );
}

