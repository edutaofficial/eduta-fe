"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseDetails } from "./CourseCreation/CourseDetails";
import { Curriculum } from "./CourseCreation/Curriculum";
import { Price } from "./CourseCreation/Price";
import { useCourseStore } from "@/store/useCourseStore";

const STEPS = [
  { id: 1, name: "Course Details", component: CourseDetails },
  { id: 2, name: "Curriculum", component: Curriculum },
  { id: 3, name: "Price", component: Price },
] as const;

interface CourseEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSaveSuccess?: () => void;
}

export function CourseEditDialog({
  open,
  onOpenChange,
  onSaveSuccess,
}: CourseEditDialogProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const {
    updateCourseDetails,
    updateCurriculum,
    updatePricing,
    loading,
    error,
    uploading,
  } = useCourseStore();

  type Validatable = {
    validateAndFocus: () => Promise<boolean>;
  };
  const detailsRef = React.useRef<Validatable>(null as unknown as Validatable);
  const curriculumRef = React.useRef<Validatable>(
    null as unknown as Validatable
  );
  const priceRef = React.useRef<Validatable>(null as unknown as Validatable);

  // Check if assets are uploading
  const isUploadingAssets =
    (currentStep === 1 && (uploading.promoVideo || uploading.coverBanner)) ||
    (currentStep === 2 && uploading.curriculum);

  // Reset to step 1 when dialog opens
  React.useEffect(() => {
    if (open) {
      setCurrentStep(1);
    }
  }, [open]);

  const goToNext = async () => {
    if (currentStep >= STEPS.length) return;

    // Validate current step
    let ok = true;
    if (currentStep === 1)
      ok = (await detailsRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 2)
      ok = (await curriculumRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 3)
      ok = (await priceRef.current?.validateAndFocus()) ?? false;
    if (!ok) return;

    try {
      // Call API based on current step
      if (currentStep === 1) {
        await updateCourseDetails();
      } else if (currentStep === 2) {
        await updateCurriculum();
      }

      // Move to next step
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as 1 | 2 | 3);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("Step transition error:", err);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      useCourseStore.setState({ error: null, validationErrors: null });
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
    }
  };

  const handleSave = async () => {
    const ok = await priceRef.current?.validateAndFocus();
    if (!ok) return;

    try {
      await updatePricing();
      // eslint-disable-next-line no-console
      console.log("Course updated successfully!");
      onOpenChange(false);
      onSaveSuccess?.();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update course.";
      // eslint-disable-next-line no-console
      console.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Course</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between pt-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    useCourseStore.setState({
                      error: null,
                      validationErrors: null,
                    });
                    setCurrentStep(step.id as 1 | 2 | 3);
                  }}
                  className={`flex flex-col items-center gap-2 ${
                    currentStep >= step.id
                      ? "text-primary-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center border-2 text-sm ${
                      currentStep >= step.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-default-300 bg-white"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs font-medium">{step.name}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 ${
                      currentStep > step.id ? "bg-primary-600" : "bg-default-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Error
                </p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <button
                onClick={() => useCourseStore.setState({ error: null })}
                className="text-destructive hover:text-destructive/80 text-sm font-medium"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 1 ? (
            <CourseDetails ref={detailsRef} />
          ) : currentStep === 2 ? (
            <Curriculum ref={curriculumRef} />
          ) : (
            <Price ref={priceRef} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeftIcon className="size-4" />
            Back
          </Button>

          <div className="flex gap-3">
            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSave}
                disabled={loading.updatePricing || isUploadingAssets}
                className="gap-2"
              >
                {loading.updatePricing ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button
                onClick={goToNext}
                className="gap-2"
                disabled={
                  loading.updateCourseDetails ||
                  loading.updateCurriculum ||
                  isUploadingAssets
                }
                title={
                  isUploadingAssets
                    ? "Please wait for assets to finish uploading"
                    : undefined
                }
              >
                {loading.updateCourseDetails || loading.updateCurriculum
                  ? "Saving..."
                  : isUploadingAssets
                    ? "Uploading assets..."
                    : "Next"}
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

