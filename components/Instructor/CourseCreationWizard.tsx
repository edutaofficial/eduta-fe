"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CourseDetails,
  type CourseDetailsHandle,
} from "./CourseCreation/CourseDetails";
import { Curriculum, type CurriculumHandle } from "./CourseCreation/Curriculum";
import { FAQs, type FAQsHandle } from "./CourseCreation/FAQs";
import { Price } from "./CourseCreation/Price";
import { Finalize, type FinalizeHandle } from "./CourseCreation/Finalize";
import { Separator } from "@radix-ui/react-separator";
import { useCourseStore } from "@/store/useCourseStore";
import { CourseDetail } from "@/components/Common";

const STEPS = [
  { id: 1, name: "Course Details", component: CourseDetails },
  { id: 2, name: "Curriculum", component: Curriculum },
  { id: 3, name: "FAQs", component: FAQs },
  { id: 4, name: "Price", component: Price },
  { id: 5, name: "Finalize", component: Finalize },
] as const;

export function CourseCreationWizard() {
  const {
    step: currentStep,
    setStep,
    createCourse,
    updateCurriculum,
    updateFAQs,
    updatePricing,
    saveDraft,
    publishCourse,
    loading,
    error,
    courseId,
    uploading,
    resetStore,
  } = useCourseStore();

  const detailsRef = React.useRef<CourseDetailsHandle>(
    null as unknown as CourseDetailsHandle
  );
  const curriculumRef = React.useRef<CurriculumHandle>(
    null as unknown as CurriculumHandle
  );
  const faqsRef = React.useRef<FAQsHandle>(
    null as unknown as FAQsHandle
  );
  const priceRef = React.useRef<{ validateAndFocus: () => Promise<boolean> }>(
    null as unknown as { validateAndFocus: () => Promise<boolean> }
  );
  const finalizeRef = React.useRef<FinalizeHandle>(
    null as unknown as FinalizeHandle
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPreview = searchParams.get("preview") === "true";

  // Check if assets are uploading (reactive from store)
  const isUploadingAssets =
    (currentStep === 1 && (uploading.promoVideo || uploading.coverBanner)) ||
    (currentStep === 2 && uploading.curriculum);

  // ALWAYS reset store when creating a NEW course (only on initial mount)
  React.useEffect(() => {
    // This is the CourseCreationWizard - always start with a clean slate
    // Any previous course data should be cleared to avoid confusion
    // eslint-disable-next-line no-console
    console.log("Resetting store for new course creation");
    resetStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only run once on mount

  // Scroll to top when step changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const goToNext = async () => {
    if (currentStep >= STEPS.length) return;

    // Validate current step
    let ok = true;
    if (currentStep === 1)
      ok = (await detailsRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 2)
      ok = (await curriculumRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 3)
      ok = (await faqsRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 4)
      ok = (await priceRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 5)
      ok = (await finalizeRef.current?.validateAndFocus()) ?? false;
    if (!ok) return;

    try {
      // Call API based on current step - store automatically advances step on success
      if (currentStep === 1) {
        await createCourse();
        // Step is advanced in store after successful createCourse
      } else if (currentStep === 2) {
        await updateCurriculum();
        // Step is advanced in store after successful updateCurriculum
      } else if (currentStep === 3) {
        await updateFAQs();
        // Step is advanced in store after successful updateFAQs
      } else if (currentStep === 4) {
        await updatePricing();
        // Step is advanced in store after successful updatePricing
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("Step transition error:", err);
      // Error is already set in store and will be displayed in UI
      // Don't break the UI flow - let user see the error and retry
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      // Clear any errors when navigating back
      useCourseStore.setState({ error: null, validationErrors: null });
      setStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
      // Scroll to top will be handled by useEffect
    }
  };

  const handleSaveDraft = async () => {
    // Validate finalize form before saving draft (required for draft)
    const ok = await finalizeRef.current?.validateAndFocus();
    if (!ok) return;

    try {
      await saveDraft();
      // eslint-disable-next-line no-console
      console.log("Course saved as draft!");
      // Reset store to clear all state for next course creation
      useCourseStore.getState().resetStore();
      router.push("/instructor/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save draft.";
      // eslint-disable-next-line no-console
      console.error(errorMessage);
      // eslint-disable-next-line no-alert
      alert(errorMessage);
    }
  };

  const handlePublish = async () => {
    const ok = await finalizeRef.current?.validateAndFocus();
    if (!ok) return;

    try {
      await publishCourse();
      // eslint-disable-next-line no-console
      console.log("Course published successfully!");
      // Reset store to clear all state for next course creation
      useCourseStore.getState().resetStore();
      router.push("/instructor/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish course.";
      // eslint-disable-next-line no-console
      console.error(errorMessage);
      // eslint-disable-next-line no-alert
      alert(errorMessage);
    }
  };

  const handlePreview = () => {
    // Add preview=true to URL
    const url = new URL(window.location.href);
    url.searchParams.set("preview", "true");
    router.push(url.pathname + url.search);
  };

  const handleClosePreview = () => {
    // Remove preview from URL (browser back will work naturally)
    router.back();
  };

  // Show preview if enabled
  if (showPreview) {
    return (
      <CourseDetail
        courseId={courseId}
        isPreview={true}
        onBack={handleClosePreview}
      />
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-default-900 mb-6">
          Create a Course
        </h1>
        <Separator className="h-px w-full bg-default-400 mb-10" />

        {/* Steps Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => {
                  // Don't allow navigation in preview mode
                  // if (showPreview) return;
                  // // Clear errors when navigating to a different step
                  // useCourseStore.setState({
                  //   error: null,
                  //   validationErrors: null,
                  // });
                  // setStep(step.id as 1 | 2 | 3 | 4);
                }}
                className={`flex flex-col items-center gap-2 ${
                  currentStep >= step.id
                    ? "text-primary-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step.id
                      ? "border-primary-600 bg-primary-50"
                      : "border-default-300 bg-white"
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {step.name}
                </span>
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-1">Error</p>
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
      <Card>
        <CardContent className="p-8">
          {currentStep === 1 ? (
            <CourseDetails ref={detailsRef} onPreview={handlePreview} />
          ) : currentStep === 2 ? (
            <Curriculum ref={curriculumRef} onPreview={handlePreview} />
          ) : currentStep === 3 ? (
            <FAQs ref={faqsRef} onPreview={handlePreview} />
          ) : currentStep === 4 ? (
            <Price ref={priceRef} onPreview={handlePreview} />
          ) : (
            <Finalize ref={finalizeRef} />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
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
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={loading.saveDraft}
                  >
                    {loading.saveDraft ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={handlePublish}
                    disabled={loading.publishCourse}
                  >
                    {loading.publishCourse ? "Publishing..." : "Save & Publish"}
                  </Button>
                </>
              ) : (
                <div className="relative">
                  <Button
                    onClick={goToNext}
                    className="gap-2"
                    disabled={
                      loading.createCourse ||
                      loading.updateCurriculum ||
                      loading.updateFAQs ||
                      loading.updatePricing ||
                      isUploadingAssets
                    }
                    title={
                      isUploadingAssets
                        ? "Please wait for assets to finish uploading"
                        : undefined
                    }
                  >
                    {loading.createCourse ||
                    loading.updateCurriculum ||
                    loading.updateFAQs ||
                    loading.updatePricing
                      ? "Saving..."
                      : isUploadingAssets
                        ? "Uploading assets..."
                        : "Next"}
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  {isUploadingAssets && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                      Assets are uploading. Please wait...
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
