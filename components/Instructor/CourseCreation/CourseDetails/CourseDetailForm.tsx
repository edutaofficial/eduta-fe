/**
 * Course Details Form Component
 * Handles form presentation, validation, and user interactions
 * Follows React best practices with proper separation of concerns
 */

"use client";

import * as React from "react";
import { useFormik } from "formik";
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
import { UploadFile } from "@/components/Common";
import { useCourseStore } from "@/store/useCourseStore";
import { useCategoryStore } from "@/store/useCategoryStore";

import { courseDetailsValidationSchema } from "@/lib/courseDetailsValidation";
import type {
  CourseDetailsFormValues,
  CourseDetailsFormProps,
  CourseDetailsHandle,
} from "@/types/courseDetails";

const CourseDetailFormInner = (
  { initialValues, onSubmit, onPreview, isSubmitting }: CourseDetailsFormProps,
  ref: React.Ref<CourseDetailsHandle>
) => {
  const { setUploading, setBasicInfo } = useCourseStore();

  // Fetch categories using the new category store
  const {
    categories: categoryList,
    loading: categoriesLoading,
    fetchCategories: fetchCategoriesFromStore,
  } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categoryList.length === 0) {
      fetchCategoriesFromStore();
    }
  }, [categoryList.length, fetchCategoriesFromStore]);

  // Formik setup with validation
  const formik = useFormik<CourseDetailsFormValues>({
    initialValues,
    enableReinitialize: true, // Enable to sync with store when coming back from preview
    validate: (values) => {
      const result = courseDetailsValidationSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, unknown> = {};
      for (const issue of result.error.issues) {
        const segments = issue.path as (string | number)[];
        let curr: Record<string, unknown> = errors;
        segments.forEach((seg, idx) => {
          const key = String(seg);
          if (idx === segments.length - 1) {
            curr[key] = issue.message;
          } else {
            if (typeof curr[key] !== "object" || curr[key] === null) {
              curr[key] = {};
            }
            curr = curr[key] as Record<string, unknown>;
          }
        });
      }
      return errors;
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit,
  });

  // File upload handlers
  const handlePromoVideoChange = React.useCallback(
    (assetId: number | null) => {
      setBasicInfo({ promoVideoId: assetId });
      formik.setFieldValue("promoVideoId", assetId);
      if (assetId !== null && formik.errors.promoVideoId) {
        formik.setFieldError("promoVideoId", undefined);
      }
    },
    [formik, setBasicInfo]
  );

  const handleCoverBannerChange = React.useCallback(
    (assetId: number | null) => {
      setBasicInfo({ courseBannerId: assetId });
      formik.setFieldValue("courseBannerId", assetId);
      if (assetId !== null && formik.errors.courseBannerId) {
        formik.setFieldError("courseBannerId", undefined);
      }
    },
    [formik, setBasicInfo]
  );

  const handlePromoVideoUploadState = React.useCallback(
    (isUploading: boolean) => setUploading({ promoVideo: isUploading }),
    [setUploading]
  );

  const handleCoverBannerUploadState = React.useCallback(
    (isUploading: boolean) => setUploading({ coverBanner: isUploading }),
    [setUploading]
  );

  // Learning points management
  const addLearningPoint = React.useCallback(() => {
    const currentPoints = formik.values.learningPoints;
    const newPoints = [...currentPoints, { id: Date.now(), text: "" }];
    formik.setFieldValue("learningPoints", newPoints);

    const filledPoints = newPoints.filter((p) => p.text.trim().length > 0);
    if (filledPoints.length >= 4 && formik.errors.learningPoints) {
      formik.setFieldError("learningPoints", undefined);
    }
  }, [formik]);

  const removeLearningPoint = React.useCallback(
    (id: number) => {
      const currentPoints = formik.values.learningPoints;
      if (currentPoints.length > 4) {
        const newPoints = currentPoints.filter((p) => p.id !== id);
        formik.setFieldValue("learningPoints", newPoints);
      }
    },
    [formik]
  );

  const handleLearningPointChange = React.useCallback(
    (index: number, value: string) => {
      formik.setFieldValue(`learningPoints.${index}.text`, value);

      setTimeout(() => {
        const filledPoints = formik.values.learningPoints.filter(
          (p) => p.text.trim().length > 0
        );
        if (
          filledPoints.length >= 4 &&
          typeof formik.errors.learningPoints === "string"
        ) {
          formik.setFieldError("learningPoints", undefined);
        }
      }, 0);
    },
    [formik]
  );

  // Expose validation method to parent
  React.useImperativeHandle(
    ref,
    () => ({
      validateAndFocus: async () => {
        // Force validate
        const errs = await formik.validateForm();

        // CRITICAL: Set errors explicitly
        await formik.setErrors(errs);

        // Mark ALL fields as touched - including learningPoints
        const touchedFields: Record<string, unknown> = {
          courseTitle: true,
          selectedCategory: true,
          learningLevel: true,
          description: true,
          promoVideoId: true,
          courseBannerId: true,
          learningPoints: true, // Mark the array itself as touched
        };

        // Also mark individual learning point fields
        if (Array.isArray(formik.values.learningPoints)) {
          touchedFields.learningPoints = formik.values.learningPoints.map(
            () => ({
              text: true,
            })
          );
        }

        await formik.setTouched(touchedFields, false);

        // Force re-render to show errors
        setTimeout(() => formik.validateForm(), 0);

        const hasErrors = Object.keys(errs).length > 0;
        if (hasErrors) {
          // Scroll to and focus the first error field
          setTimeout(() => {
            const errorElement = document.querySelector(
              '[aria-invalid="true"]'
            ) as HTMLElement | null;
            
            if (errorElement) {
              // Scroll to the error field with some padding for better visibility
              errorElement.scrollIntoView({ 
                behavior: "smooth", 
                block: "center",
                inline: "nearest"
              });
              
              // Focus the field after scrolling for better UX
              setTimeout(() => {
                errorElement.focus();
              }, 300);
            }
          }, 100);
          return false;
        }

        // CRITICAL: Sync data to store via onSubmit when validation passes
        await onSubmit(formik.values);

        return true;
      },
      getValues: () => formik.values,
    }),
    [formik, onSubmit]
  );

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
              if (formik.errors.courseTitle) {
                formik.setFieldError("courseTitle", undefined);
              }
            }}
            onBlur={formik.handleBlur}
            disabled={isSubmitting}
            className={cn(
              formik.touched.courseTitle && formik.errors.courseTitle
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            )}
            aria-invalid={
              !!(formik.touched.courseTitle && formik.errors.courseTitle)
            }
          />
          {formik.touched.courseTitle && formik.errors.courseTitle && (
            <p className="text-sm text-destructive font-medium">
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
            onValueChange={(v) => {
              formik.setFieldValue("learningLevel", v);
              if (formik.errors.learningLevel) {
                formik.setFieldError("learningLevel", undefined);
              }
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={cn(
                formik.touched.learningLevel && formik.errors.learningLevel
                  ? "border-destructive focus:ring-destructive"
                  : ""
              )}
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
            <p className="text-sm text-destructive font-medium">
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
          onValueChange={(val) => {
            formik.setFieldValue("selectedCategory", val);
            if (formik.errors.selectedCategory) {
              formik.setFieldError("selectedCategory", undefined);
            }
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger
            className={cn(
              formik.touched.selectedCategory && formik.errors.selectedCategory
                ? "border-destructive focus:ring-destructive"
                : ""
            )}
            aria-invalid={
              !!(
                formik.touched.selectedCategory &&
                formik.errors.selectedCategory
              )
            }
          >
            <SelectValue
              placeholder={
                categoriesLoading ? "Loading..." : "Select subcategory"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categoryList.map((category) => (
              <React.Fragment key={category.categoryId}>
                {/* Category as heading (disabled) */}
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50 sticky top-0 z-10">
                  {category.name} ({category.subcategories.length})
                </div>
                {/* Subcategories (selectable) */}
                {category.subcategories.map((subcategory) => (
                  <SelectItem
                    key={subcategory.categoryId}
                    value={subcategory.categoryId}
                  >
                    {subcategory.name}
                  </SelectItem>
                ))}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.selectedCategory && formik.errors.selectedCategory && (
          <p className="text-sm text-destructive font-medium">
            {String(formik.errors.selectedCategory)}
          </p>
        )}
      </div>

      {/* Course Description */}
      <div className="flex flex-col gap-2">
        <Label>
          Course Description <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={formik.values.description}
          onChange={(v) => {
            formik.setFieldValue("description", v);
            if (formik.errors.description) {
              formik.setFieldError("description", undefined);
            }
          }}
          placeholder="Describe what students will learn in this course..."
          maxLength={6500}
          error={!!(formik.touched.description && formik.errors.description)}
        />
        {formik.touched.description && formik.errors.description && (
          <p className="text-sm text-destructive font-medium">
            {formik.errors.description}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promo Video Upload */}
        <UploadFile
          label="Promo Video"
          accept="video/*"
          value={formik.values.promoVideoId}
          onChange={handlePromoVideoChange}
          onUploadStateChange={handlePromoVideoUploadState}
          disabled={isSubmitting}
          error={
            formik.touched.promoVideoId && formik.errors.promoVideoId
              ? String(formik.errors.promoVideoId)
              : undefined
          }
        />

        {/* Cover Banner Upload */}
        <UploadFile
          label="Cover Banner"
          accept="image/*"
          value={formik.values.courseBannerId}
          onChange={handleCoverBannerChange}
          onUploadStateChange={handleCoverBannerUploadState}
          required
          disabled={isSubmitting}
          error={
            formik.touched.courseBannerId && formik.errors.courseBannerId
              ? String(formik.errors.courseBannerId)
              : undefined
          }
        />
      </div>

      {/* Learning Points */}
      <div className="space-y-4">
        <Label>
          Learning Points <span className="text-destructive">*</span>
        </Label>
        <p
          className={cn(
            "text-xs font-medium",
            typeof formik.errors.learningPoints === "string" &&
              formik.touched.learningPoints
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          At least 4 learning points are required (max 120 characters each)
        </p>

        <div
          className={cn(
            "rounded-lg border-2 p-4 transition-all duration-200",
            typeof formik.errors.learningPoints === "string" &&
              formik.touched.learningPoints
              ? "border-destructive "
              : "border-none"
          )}
        >
          <div className="space-y-3">
            {formik.values.learningPoints.map((point, index) => (
              <div key={point.id} className="flex items-start gap-3">
                <span className="mt-2.5 text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <Textarea
                    name={`learningPoints.${index}.text`}
                    placeholder="Enter a learning point (max 120 characters)"
                    value={point.text}
                    onChange={(e) =>
                      handleLearningPointChange(index, e.target.value)
                    }
                    onBlur={() =>
                      formik.setFieldTouched(`learningPoints.${index}.text`)
                    }
                    maxLength={120}
                    rows={1}
                    disabled={isSubmitting}
                    className={cn(
                      "resize-none",
                      formik.touched.learningPoints?.[index]?.text &&
                        Array.isArray(formik.errors.learningPoints) &&
                        (
                          formik.errors.learningPoints as unknown as Array<{
                            text?: string;
                          }>
                        )[index]?.text
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    )}
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
                      <p className="text-sm text-destructive font-medium mt-1">
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
                {formik.values.learningPoints.length > 4 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLearningPoint(point.id)}
                    disabled={isSubmitting}
                    className="mt-1.5 hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove learning point ${index + 1}`}
                  >
                    <XIcon className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning points array error - ALWAYS CHECK AND DISPLAY */}
        {typeof formik.errors.learningPoints === "string" &&
          formik.touched.learningPoints && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 -mt-2">
              <p className="text-sm text-destructive font-semibold">
                ⚠️ {String(formik.errors.learningPoints)}
              </p>
            </div>
          )}

        <Button
          type="button"
          variant="outline"
          onClick={addLearningPoint}
          disabled={formik.values.learningPoints.length >= 10 || isSubmitting}
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
            onClick={async () => {
              // Save current form data to store before preview
              // This ensures preview has access to the latest form data
              await onSubmit(formik.values);
              // Then trigger preview
              onPreview();
            }}
            disabled={isSubmitting}
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

export const CourseDetailForm = React.forwardRef<
  CourseDetailsHandle,
  CourseDetailsFormProps
>(CourseDetailFormInner);
