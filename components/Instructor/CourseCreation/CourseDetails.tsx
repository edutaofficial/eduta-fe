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
import { PlusIcon, XIcon, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseStore } from "@/store/useCourseStore";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/types/course";
import { UploadFile } from "@/components/Common";

// Zod schema for validation
const courseDetailsSchema = z.object({
  courseTitle: z.string().min(1, "Course title is required"),
  selectedCategory: z.string().min(1, "Category is required"),
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

export type CourseDetailsHandle = {
  validateAndFocus: () => Promise<boolean>;
};

interface CourseDetailsProps {
  onPreview?: () => void;
}

const CourseDetailsInner = (
  { onPreview }: CourseDetailsProps,
  ref: React.Ref<CourseDetailsHandle>
) => {
  const {
    basicInfo,
    setBasicInfo,
    fetchCategories,
    setUploading,
    validationErrors,
    clearValidationErrors,
  } = useCourseStore();

  // Debug: Log basicInfo when component mounts
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("CourseDetails mounted with basicInfo:", {
      title: basicInfo.title,
      categoryId: basicInfo.categoryId,
      learningLevel: basicInfo.learningLevel,
      learningPoints: basicInfo.learningPoints,
    });
    // eslint-disable-next-line no-console
    console.log(
      "Formik initialValues.selectedCategory:",
      formik.values.selectedCategory
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only on mount

  // Clear server validation errors when user starts typing
  React.useEffect(() => {
    if (validationErrors) {
      return () => clearValidationErrors();
    }
  }, [validationErrors, clearValidationErrors]);

  // Fetch categories
  const { data: categories = { data: [] } } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: true,
  });

  const categoryOptions = (categories as { data: Category[] })?.data?.map(
    (cat) => ({
      value: cat.categoryId,
      label: cat.name,
    })
  );

  // Normalize learning level to capitalized format
  const normalizeLearningLevel = (level: string): string => {
    if (!level) return "";
    const lower = level.toLowerCase();
    if (lower === "beginner") return "Beginner";
    if (lower === "intermediate") return "Intermediate";
    if (lower === "advanced") return "Advanced";
    if (lower === "expert") return "Expert";
    return level; // Return as-is if already capitalized or unknown
  };

  // Initialize formik with store values
  const formik = useFormik<CourseDetailsFormValues>({
    initialValues: {
      courseTitle: basicInfo.title || "",
      selectedCategory: basicInfo.categoryId || "",
      learningLevel: normalizeLearningLevel(basicInfo.learningLevel || ""),
      description: basicInfo.description || "",
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
            ],
    },
    enableReinitialize: false, // Keep as false since we use key prop for remounting
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
      // Sync to store (this will be called when moving to next step)
      const learningPoints = vals.learningPoints.map((lp) => ({
        description: lp.text,
      }));

      setBasicInfo({
        title: vals.courseTitle,
        categoryId: vals.selectedCategory,
        learningLevel: vals.learningLevel,
        description: vals.description,
        fullDescription: vals.description,
        language: "English",
        learningPoints,
        requirements: [],
        targetAudience: [],
        tags: [],
      });
    },
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Sync formik values to store on change (with proper dependency tracking)
  const prevValuesRef = React.useRef(formik.values);
  React.useEffect(() => {
    // Only update if values actually changed
    const hasChanged =
      prevValuesRef.current.courseTitle !== formik.values.courseTitle ||
      prevValuesRef.current.selectedCategory !==
        formik.values.selectedCategory ||
      prevValuesRef.current.learningLevel !== formik.values.learningLevel ||
      prevValuesRef.current.description !== formik.values.description ||
      JSON.stringify(prevValuesRef.current.learningPoints) !==
        JSON.stringify(formik.values.learningPoints);

    if (hasChanged) {
      prevValuesRef.current = formik.values;

      const learningPoints = formik.values.learningPoints.map((lp) => ({
        description: lp.text,
      }));

      setBasicInfo({
        title: formik.values.courseTitle,
        categoryId: formik.values.selectedCategory,
        learningLevel: formik.values.learningLevel,
        description: formik.values.description,
        fullDescription: formik.values.description,
        language: "English",
        learningPoints,
        requirements: [],
        targetAudience: [],
        tags: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.courseTitle,
    formik.values.selectedCategory,
    formik.values.learningLevel,
    formik.values.description,
    formik.values.learningPoints,
    setBasicInfo,
  ]);

  // Memoize upload callbacks to prevent infinite loops
  const handlePromoVideoChange = React.useCallback(
    (assetId: number | null) => {
      setBasicInfo({ promoVideoId: assetId });
    },
    [setBasicInfo]
  );

  const handlePromoVideoUploadState = React.useCallback(
    (isUploading: boolean) => {
      setUploading({ promoVideo: isUploading });
    },
    [setUploading]
  );

  const handleCoverBannerChange = React.useCallback(
    (assetId: number | null) => {
      setBasicInfo({ courseBannerId: assetId });
    },
    [setBasicInfo]
  );

  const handleCoverBannerUploadState = React.useCallback(
    (isUploading: boolean) => {
      setUploading({ coverBanner: isUploading });
    },
    [setUploading]
  );

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
            onChange={(e) => {
              formik.handleChange(e);
              if (validationErrors?.title) clearValidationErrors();
            }}
            aria-invalid={
              !!(formik.touched.courseTitle && formik.errors.courseTitle) ||
              !!validationErrors?.title
            }
          />
          {formik.touched.courseTitle && formik.errors.courseTitle && (
            <p className="text-sm text-destructive mt-1">
              {formik.errors.courseTitle}
            </p>
          )}
          {validationErrors?.title && (
            <p className="text-sm text-destructive mt-1">
              {validationErrors.title}
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
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
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
        <Select
          value={formik.values.selectedCategory}
          onValueChange={(val) => formik.setFieldValue("selectedCategory", val)}
        >
          <SelectTrigger
            aria-invalid={
              !!(
                formik.touched.selectedCategory &&
                formik.errors.selectedCategory
              )
            }
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions?.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.selectedCategory && formik.errors.selectedCategory && (
          <p className="text-sm text-destructive mt-1">
            {String(formik.errors.selectedCategory)}
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
            !!(formik.touched.description && formik.errors.description) ||
            !!validationErrors?.description
          }
        >
          <RichTextEditor
            value={formik.values.description}
            onChange={(v) => {
              formik.setFieldValue("description", v);
              if (validationErrors?.description) clearValidationErrors();
            }}
            placeholder="Describe what students will learn in this course..."
            maxLength={2500}
            className={cn(
              (formik.touched.description && formik.errors.description) ||
                validationErrors?.description
                ? "border-destructive"
                : ""
            )}
          />
        </div>
        {formik.touched.description && formik.errors.description && (
          <p className="text-sm text-destructive mt-1">
            {formik.errors.description}
          </p>
        )}
        {validationErrors?.description && (
          <p className="text-sm text-destructive mt-1">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promo Video Upload */}
        <UploadFile
          label="Promo Video"
          accept="video/*"
          value={basicInfo.promoVideoId}
          onChange={handlePromoVideoChange}
          onUploadStateChange={handlePromoVideoUploadState}
        />

        {/* Cover Banner Upload */}
        <UploadFile
          label="Cover Banner"
          accept="image/*"
          value={basicInfo.courseBannerId}
          onChange={handleCoverBannerChange}
          onUploadStateChange={handleCoverBannerUploadState}
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
                        Array.isArray(formik.errors.learningPoints) &&
                        (
                          formik.errors.learningPoints as unknown as Array<{
                            text?: string;
                          }>
                        )[index]?.text
                      )
                    }
                  />
                  {formik.touched.learningPoints?.[index]?.text &&
                    Array.isArray(formik.errors.learningPoints) &&
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
    </form>
  );
};

export const CourseDetails = React.forwardRef<
  CourseDetailsHandle,
  CourseDetailsProps
>(CourseDetailsInner);
