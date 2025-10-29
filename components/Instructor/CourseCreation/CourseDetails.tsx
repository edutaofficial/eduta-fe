"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { UploadIcon, PlusIcon, XIcon } from "lucide-react";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Zod schema for validation
const courseDetailsSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required"),
  selectedCategories: z
    .array(z.string())
    .min(1, "At least one category is required"),
  learningLevel: z.string().min(1, "Learning level is required"),
  description: z.string().min(1, "Course description is required"),
  learningPoints: z
    .array(
      z.object({
        id: z.number(),
        text: z
          .string()
          .min(1, "Learning point cannot be empty")
          .max(120, "Learning point must be 120 characters or less"),
      })
    )
    .min(3, "At least 3 learning points are required")
    .max(10, "Maximum 10 learning points allowed"),
  promoVideo: z.instanceof(File).nullable().optional(),
  coverBanner: z.instanceof(File).nullable().optional(),
});

type CourseDetailsFormValues = z.infer<typeof courseDetailsSchema>;

interface FileUploadProps {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

function FileUpload({
  label,
  accept,
  file,
  onFileChange,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files[0]) {
      onFileChange(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      onFileChange(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary-600 bg-primary-50"
            : "hover:border-primary-400"
        } ${error ? "border-destructive" : ""}`}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadIcon className="size-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive/80"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Drag and drop file or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              {accept === "video/*"
                ? "Supports MP4, MOV, AVI"
                : "Supports PNG, JPG, WEBP"}
            </p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export type CourseDetailsHandle = { validateAndFocus: () => Promise<boolean> };

const CourseDetailsInner = (_: object, ref: React.Ref<CourseDetailsHandle>) => {
  const formik = useFormik<CourseDetailsFormValues>({
    initialValues: {
      courseTitle: "",
      selectedCategories: [],
      learningLevel: "",
      description: "",
      learningPoints: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
      ],
      promoVideo: null,
      coverBanner: null,
    },
    validate: (values) => {
      const result = courseDetailsSchema.safeParse(values);
      if (result.success)
        return {} as Partial<Record<keyof CourseDetailsFormValues, unknown>>;
      const errors: Record<string, unknown> = {};
      for (const issue of result.error.issues) {
        const segments = issue.path as (string | number)[];
        let curr: Record<string, unknown> = errors;
        segments.forEach((seg, idx) => {
          const key = String(seg);
          if (idx === segments.length - 1) {
            curr[key] = issue.message;
          } else {
            if (typeof curr[key] !== "object" || curr[key] === null)
              curr[key] = {};
            curr = curr[key] as Record<string, unknown>;
          }
        });
      }
      return errors as Record<string, unknown>;
    },
    onSubmit: (vals) => {
      // eslint-disable-next-line no-console
      console.log("Form Data:", vals);
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const categoryOptions = CONSTANTS.CATEGORIES.slice(0, 6).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const addLearningPoint = () => {
    const currentPoints = formik.values.learningPoints;
    const newId = Date.now();
    formik.setFieldValue("learningPoints", [
      ...currentPoints,
      { id: newId, text: "" },
    ]);
  };

  const removeLearningPoint = (id: number) => {
    const currentPoints = formik.values.learningPoints;
    if (currentPoints.length > 3) {
      formik.setFieldValue(
        "learningPoints",
        currentPoints.filter((p) => p.id !== id)
      );
    }
  };

  React.useImperativeHandle(ref, () => ({
    validateAndFocus: async () => {
      const errs = await formik.validateForm();
      // mark all touched recursively
      const touchAll = (obj: unknown): unknown => {
        if (Array.isArray(obj)) return obj.map((v) => touchAll(v));
        if (obj && typeof obj === "object") {
          const out: Record<string, unknown> = {};
          for (const k of Object.keys(obj as Record<string, unknown>))
            out[k] = touchAll((obj as Record<string, unknown>)[k]);
          return out;
        }
        return true;
      };
      formik.setTouched(touchAll(errs) as Record<string, unknown>);
      const hasErrors = Object.keys(errs).length > 0;
      if (hasErrors) {
        const el = document.querySelector(
          '[aria-invalid="true"]'
        ) as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    },
  }));

  const watchedPoints = formik.values.learningPoints || [];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Row 1: Course Title and Learning Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="courseTitle">
            Course Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="courseTitle"
            name="courseTitle"
            placeholder="Enter course title"
            value={formik.values.courseTitle}
            onChange={formik.handleChange}
            aria-invalid={
              !!(formik.touched.courseTitle && formik.errors.courseTitle)
            }
          />
          {formik.touched.courseTitle && formik.errors.courseTitle && (
            <p className="text-sm text-destructive mt-1">
              {formik.errors.courseTitle}
            </p>
          )}
        </div>

        {/* Learning Level */}
        <div className="flex flex-col gap-2">
          <Label>
            Learning Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formik.values.learningLevel}
            onValueChange={(v) => formik.setFieldValue("learningLevel", v)}
          >
            <SelectTrigger
              aria-invalid={
                !!(formik.touched.learningLevel && formik.errors.learningLevel)
              }
            >
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.learningLevel && formik.errors.learningLevel && (
            <p className="text-sm text-destructive mt-1">
              {formik.errors.learningLevel}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Category */}
      <div className="flex flex-col gap-2">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <MultiSelect
          options={categoryOptions}
          value={formik.values.selectedCategories}
          onValueChange={(vals) =>
            formik.setFieldValue("selectedCategories", vals)
          }
          placeholder="Select categories..."
          emptyIndicator="No category found."
          aria-invalid={
            !!(
              formik.touched.selectedCategories &&
              formik.errors.selectedCategories
            )
          }
        />
        {formik.touched.selectedCategories &&
          formik.errors.selectedCategories && (
            <p className="text-sm text-destructive mt-1">
              {String(formik.errors.selectedCategories)}
            </p>
          )}
      </div>

      {/* Course Description */}
      <div className="flex flex-col gap-2">
        <Label>
          Course Description <span className="text-destructive">*</span>
        </Label>
        <div
          aria-invalid={
            !!(formik.touched.description && formik.errors.description)
          }
        >
          <RichTextEditor
            value={formik.values.description}
            onChange={(v) => formik.setFieldValue("description", v)}
            placeholder="Describe what students will learn in this course..."
            className={cn(
              formik.touched.description &&
                formik.errors.description &&
                "border-destructive"
            )}
          />
        </div>
        {formik.touched.description && formik.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {formik.errors.description}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promo Video Upload */}
        <FileUpload
          label="Promo Video"
          accept="video/*"
          file={formik.values.promoVideo || null}
          onFileChange={(file) => formik.setFieldValue("promoVideo", file)}
          error={
            formik.touched.promoVideo
              ? (formik.errors.promoVideo as unknown as string | undefined)
              : undefined
          }
        />

        {/* Cover Banner Upload */}
        <FileUpload
          label="Cover Banner"
          accept="image/*"
          file={formik.values.coverBanner || null}
          onFileChange={(file) => formik.setFieldValue("coverBanner", file)}
          error={
            formik.touched.coverBanner
              ? (formik.errors.coverBanner as unknown as string | undefined)
              : undefined
          }
        />
      </div>

      {/* Learning Points */}
      <div className="space-y-4">
        <Label>
          Learning Points <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground mb-4">
          Add at least 3 learning points (max 120 characters each)
        </p>

        <div>
          <div className="space-y-3">
            {watchedPoints.map((point, index) => (
              <div key={point.id} className="flex items-start gap-3">
                <span className="mt-2 text-sm font-medium">{index + 1}.</span>
                <div className="flex-1">
                  <Textarea
                    name={`learningPoints.${index}.text`}
                    placeholder="Enter a learning point (max 120 characters)"
                    value={formik.values.learningPoints[index].text}
                    onChange={formik.handleChange}
                    maxLength={120}
                    rows={1}
                    aria-invalid={
                      !!(
                        formik.touched.learningPoints?.[index]?.text &&
                        (
                          formik.errors.learningPoints as unknown as Array<{
                            text?: string;
                          }>
                        )[index]?.text
                      )
                    }
                  />
                  {formik.touched.learningPoints?.[index]?.text &&
                    (
                      formik.errors.learningPoints as unknown as Array<{
                        text?: string;
                      }>
                    )[index]?.text && (
                      <p className="text-sm text-destructive mt-1">
                        {
                          (
                            formik.errors.learningPoints as unknown as Array<{
                              text?: string;
                            }>
                          )[index].text
                        }
                      </p>
                    )}
                </div>
                {watchedPoints.length > 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLearningPoint(point.id)}
                    className="mt-2"
                  >
                    <XIcon className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {typeof formik.errors.learningPoints === "string" && (
            <p className="text-sm text-destructive mt-1">
              {String(formik.errors.learningPoints)}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addLearningPoint}
          className="gap-2"
        >
          <PlusIcon className="size-4" />
          Add Learning Point
        </Button>
      </div>
    </form>
  );
};

export const CourseDetails = React.forwardRef<CourseDetailsHandle, object>(
  CourseDetailsInner
);
