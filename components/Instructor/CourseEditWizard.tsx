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
import { Curriculum } from "./CourseCreation/Curriculum";
import { FAQs, type FAQsHandle } from "./CourseCreation/FAQs";
import { Price } from "./CourseCreation/Price";
import { Finalize } from "./CourseCreation/Finalize";
import { Separator } from "@radix-ui/react-separator";
import {
  useCourseStore,
  transformCurriculumToAPI,
  transformPricingToAPI,
} from "@/store/useCourseStore";
import { CourseDetail } from "@/components/Common";
import { getCourseById } from "@/app/api/course/getCourseById";
import { getCourseForEdit } from "@/app/api/course/getCourseForEdit";
import { getFAQs as getFAQsApi } from "@/app/api/instructor/faqs";
import { normalizeForComparison } from "@/lib/normalizeForComparison";

const STEPS = [
  { id: 1, name: "Course Details", component: CourseDetails },
  { id: 2, name: "Curriculum", component: Curriculum },
  { id: 3, name: "FAQs", component: FAQs },
  { id: 4, name: "Price", component: Price },
  { id: 5, name: "Finalize", component: Finalize },
] as const;

interface CourseEditWizardProps {
  courseId: string;
  isDraft: boolean; // true for draft-complete, false for edit
}

export function CourseEditWizard({ courseId, isDraft }: CourseEditWizardProps) {
  const {
    step: currentStep,
    setStep,
    updateCourseDetails,
    updateCurriculum,
    updateFAQs,
    updatePricing,
    saveDraft,
    publishCourse,
    loading,
    error,
    uploading,
    savedSnapshots,
  } = useCourseStore();

  // Subscribe to state changes for reactive comparison
  const basicInfo = useCourseStore((state) => state.basicInfo);
  const curriculum = useCourseStore((state) => state.curriculum);
  const faqs = useCourseStore((state) => state.faqs);
  const pricing = useCourseStore((state) => state.pricing);
  const finalize = useCourseStore((state) => state.finalize);

  type Validatable = {
    validateAndFocus: () => Promise<boolean>;
  };
  const detailsRef = React.useRef<CourseDetailsHandle>(null);
  const curriculumRef = React.useRef<Validatable>(null);
  const faqsRef = React.useRef<FAQsHandle>(null);
  const priceRef = React.useRef<Validatable>(null);
  const finalizeRef = React.useRef<Validatable>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPreview = searchParams.get("preview") === "true";
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Track if any changes were made (only for edit mode, not draft)
  // Keeping this for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasAnyChanges, setHasAnyChanges] = React.useState(false);

  // Key to force form remount after data loads
  const [formsKey, setFormsKey] = React.useState(0);

  // Simple flag to track if ANY field has been modified (for immediate button enable)
  const [hasManualChanges, setHasManualChanges] = React.useState(false);
  
  // Reactive state to track if current step has changes
  const [currentStepHasChanges, setCurrentStepHasChanges] = React.useState(false);

  // Callback to mark that changes have been made
  const markAsChanged = React.useCallback(() => {
    if (!hasManualChanges) {
      setHasManualChanges(true);
      // eslint-disable-next-line no-console
      console.log("🔥 CHANGE DETECTED! User modified a field. Button enabled!");
    }
  }, [hasManualChanges]);

  // Check if assets are uploading (reactive from store)
  const isUploadingAssets =
    (currentStep === 1 && (uploading.promoVideo || uploading.coverBanner)) ||
    (currentStep === 2 && uploading.curriculum);

  // Debug: Log when component mounts and state updates
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("=== CourseEditWizard Mounted ===");
    // eslint-disable-next-line no-console
    console.log("isDraft:", isDraft);
    // eslint-disable-next-line no-console
    console.log("currentStep:", currentStep);
  }, [isDraft, currentStep]);

  // Debug: Log state updates
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("=== State Update ===", {
      currentStep,
      basicInfoTitle: basicInfo?.title,
      curriculumSections: curriculum?.sections?.length,
      faqsCount: faqs?.length,
      pricingAmount: pricing?.price,
      savedSnapshotKeys: Object.keys(savedSnapshots),
      savedSnapshotLengths: {
        basicInfo: savedSnapshots?.basicInfo?.length,
        curriculum: savedSnapshots?.curriculum?.length,
        faqs: savedSnapshots?.faqs?.length,
        pricing: savedSnapshots?.pricing?.length,
        finalize: savedSnapshots?.finalize?.length,
      }
    });
  }, [currentStep, basicInfo, curriculum, faqs, pricing, finalize, savedSnapshots]);

  // Load course data on mount
  React.useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (isDraft) {
          // For draft, use getCourseById which includes currentStep
          const response = await getCourseById(courseId);
          const { data } = response;

          // Transform API response to store format
          const basicInfoForStore = {
            title: data.courseDetails.title,
            categoryId: data.courseDetails.categoryId,
            learningLevel: data.courseDetails.learningLevel,
            description: data.courseDetails.description,
            shortDescription: data.courseDetails.description,
            fullDescription: data.courseDetails.fullDescription,
            language: data.courseDetails.language,
            promoVideoId: data.courseDetails.promoVideoId,
            courseBannerId: data.courseDetails.courseBannerId,
            courseLogoId: data.courseDetails.courseLogoId,
            certificateDescription: data.courseDetails.certificateDescription || "",
            learningPoints: data.courseDetails.learningPoints.map((lp) => ({
              description: lp.description,
            })),
            requirements: data.courseDetails.requirements.map(
              (r) => r.description
            ),
            whoThisCourseIsFor: data.courseDetails.targetAudience.map(
              (ta) => ta.description
            ),
            targetAudience: data.courseDetails.targetAudience.map(
              (ta) => ta.description
            ),
            tags: data.courseDetails.tags
              .map((t) => t.tagName || "")
              .filter(Boolean),
          };

          // Transform curriculum
          const curriculumForStore = {
            sections: data.curriculum.sections.map((section) => ({
              id: section.sectionId,
              title: section.title,
              description: section.description,
              order: section.displayOrder,
              lectures: section.lectures.map((lecture) => ({
                id: lecture.lectureId,
                title: lecture.title,
                description: lecture.description,
                order: lecture.displayOrder,
                duration: lecture.duration,
                isFree: lecture.isPreview,
                videoId: lecture.videoId,
                resources: lecture.resources.map((resource) => ({
                  id: resource.resourceId,
                  title: resource.resourceName,
                  fileId: resource.assetId,
                })),
              })),
            })),
          };

          // Transform pricing
          const pricingForStore = {
            price: data.pricing.amount,
            currency: data.pricing.currency,
            originalPrice: data.pricing.originalAmount,
            discountPercentage: data.pricing.discountPercentage,
            isFree: data.pricing.amount === 0,
            priceTier: data.pricing.priceTier,
          };

          // Transform finalize
          const finalizeForStore = {
            welcomeMessage: data.finalize?.welcomeMessage || "",
            congratulationMessage: data.finalize?.congratulationMessage || "",
          };

          // Debug: Log what we're about to set
          // eslint-disable-next-line no-console
          console.log("About to set store (DRAFT MODE) with:", {
            courseId,
            basicInfo: basicInfoForStore,
            curriculum: curriculumForStore,
            pricing: pricingForStore,
            finalize: finalizeForStore,
          });

          // Transform to API format for snapshot comparison
          const apiCurriculum = transformCurriculumToAPI(curriculumForStore);
          const apiPricing = transformPricingToAPI(pricingForStore);

          // Load FAQs from API
          let faqsForStore: Array<{ faqId: string; question: string; answer: string }> = [];
          try {
            const faqsData = await getFAQsApi(courseId);
            faqsForStore = faqsData.map((f) => ({
              faqId: f.faqId,
              question: f.question,
              answer: f.answer,
            }));
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Failed to load FAQs:", err);
            // Use empty array if FAQs can't be loaded
            faqsForStore = [];
          }

          // Prepare saved snapshots
          const snapshotsToSave = {
            basicInfo: normalizeForComparison(basicInfoForStore),
            curriculum: normalizeForComparison(apiCurriculum), // Store API format
            faqs: normalizeForComparison(faqsForStore),
            pricing: normalizeForComparison(apiPricing), // Store API format
            finalize: normalizeForComparison(finalizeForStore),
          };

          // eslint-disable-next-line no-console
          console.log("💾 [Data Loading DRAFT] Setting saved snapshots:", {
            basicInfoLength: snapshotsToSave.basicInfo.length,
            curriculumLength: snapshotsToSave.curriculum.length,
            faqsLength: snapshotsToSave.faqs.length,
            pricingLength: snapshotsToSave.pricing.length,
            finalizeLength: snapshotsToSave.finalize.length,
          });

          // Load data into store
          useCourseStore.setState({
            courseId,
            basicInfo: basicInfoForStore,
            curriculum: curriculumForStore,
            faqs: faqsForStore,
            pricing: pricingForStore,
            finalize: finalizeForStore,
            step: data.currentStep as 1 | 2 | 3 | 4 | 5, // Start from currentStep
            savedSnapshots: snapshotsToSave,
          });

          // Debug: Immediately verify what was set
          const storeAfterSet = useCourseStore.getState();
          // eslint-disable-next-line no-console
          console.log("Store IMMEDIATELY after setState (DRAFT):", {
            title: storeAfterSet.basicInfo.title,
            categoryId: storeAfterSet.basicInfo.categoryId,
            learningLevel: storeAfterSet.basicInfo.learningLevel,
            learningPoints: storeAfterSet.basicInfo.learningPoints,
          });
        } else {
          // For edit, use getCourseForEdit (existing courses)
          const courseData = await getCourseForEdit(courseId);
          // eslint-disable-next-line no-console
          console.log(courseData);
          // Convert UIBasicInfo to CreateCourseRequest format
          const basicInfoForStore = {
            title: courseData.basicInfo.title,
            categoryId: courseData.basicInfo.categoryId,
            learningLevel: courseData.basicInfo.learningLevel,
            description: courseData.basicInfo.shortDescription || "",
            shortDescription: courseData.basicInfo.shortDescription || "",
            fullDescription: courseData.basicInfo.description,
            language: courseData.basicInfo.language,
            promoVideoId: courseData.basicInfo.promoVideoId,
            courseBannerId: courseData.basicInfo.courseBannerId,
            courseLogoId: courseData.basicInfo.courseLogoId,
            certificateDescription: courseData.basicInfo.certificateDescription || "",
            learningPoints: courseData.basicInfo.learningPoints.map((lp) => ({
              description: lp.text,
            })),
            requirements: courseData.basicInfo.prerequisites.map((p) => p.text),
            whoThisCourseIsFor: courseData.basicInfo.targetAudiences.map(
              (ta) => ta.text
            ),
            targetAudience: courseData.basicInfo.targetAudiences.map(
              (ta) => ta.text
            ),
            tags: [],
          };

          // Debug: Log what we're about to set
          // eslint-disable-next-line no-console
          console.log("About to set store with:", {
            courseId,
            basicInfo: basicInfoForStore,
            curriculum: courseData.curriculum,
            pricing: courseData.pricing,
          });

          // Debug: Specifically check categoryId
          // eslint-disable-next-line no-console
          console.log("CategoryId being set:", basicInfoForStore.categoryId);

          // Transform to API format for snapshot comparison
          const apiCurriculum = transformCurriculumToAPI(courseData.curriculum);
          const apiPricing = transformPricingToAPI(courseData.pricing);

          // Transform finalize data (or use empty if not available)
          const finalizeForStore = courseData.finalize
            ? {
                welcomeMessage: courseData.finalize.welcomeMessage || "",
                congratulationMessage:
                  courseData.finalize.congratulationMessage || "",
              }
            : {
                welcomeMessage: "",
                congratulationMessage: "",
              };

          // Load FAQs from API
          let faqsForStore: Array<{ faqId: string; question: string; answer: string }> = [];
          try {
            const faqsData = await getFAQsApi(courseId);
            faqsForStore = faqsData.map((f) => ({
              faqId: f.faqId,
              question: f.question,
              answer: f.answer,
            }));
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("Failed to load FAQs:", err);
            // Use empty array if FAQs can't be loaded
            faqsForStore = [];
          }

          // Prepare saved snapshots
          const snapshotsToSave = {
            basicInfo: normalizeForComparison(basicInfoForStore),
            curriculum: normalizeForComparison(apiCurriculum), // Store API format
            faqs: normalizeForComparison(faqsForStore),
            pricing: normalizeForComparison(apiPricing), // Store API format
            finalize: normalizeForComparison(finalizeForStore),
          };

          // eslint-disable-next-line no-console
          console.log("💾 [Data Loading] Setting saved snapshots:", {
            basicInfoLength: snapshotsToSave.basicInfo.length,
            curriculumLength: snapshotsToSave.curriculum.length,
            faqsLength: snapshotsToSave.faqs.length,
            pricingLength: snapshotsToSave.pricing.length,
            finalizeLength: snapshotsToSave.finalize.length,
          });

          // Load data into store (start from step 1 for editing)
          useCourseStore.setState({
            courseId,
            basicInfo: basicInfoForStore,
            curriculum: courseData.curriculum,
            faqs: faqsForStore,
            pricing: courseData.pricing,
            finalize: finalizeForStore,
            step: 1, // Always start from step 1 for editing
            savedSnapshots: snapshotsToSave,
          });

          // Debug: Immediately verify what was set
          const storeAfterSet = useCourseStore.getState();
          // eslint-disable-next-line no-console
          console.log("Store IMMEDIATELY after setState:", {
            title: storeAfterSet.basicInfo.title,
            categoryId: storeAfterSet.basicInfo.categoryId,
            learningLevel: storeAfterSet.basicInfo.learningLevel,
            learningPoints: storeAfterSet.basicInfo.learningPoints,
          });
        }

        // Debug: Log the final store state
        // eslint-disable-next-line no-console
        console.log("Store state after loading:", useCourseStore.getState());

        // Use setTimeout to ensure store update completes before remounting
        setTimeout(() => {
          // Force forms to remount with new data
          setFormsKey((prev) => prev + 1);

          // Then stop loading so forms render with new key and populated store
          setIsLoading(false);

          // Debug: Verify store one more time
          // eslint-disable-next-line no-console
          console.log(
            "Store state right before forms render:",
            useCourseStore.getState()
          );
        }, 0);
      } catch (err) {
        setLoadError(
          err instanceof Error
            ? err.message
            : "Failed to load course. Please try again."
        );
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, isDraft]);

  // Scroll to top when step changes and reset manual change flag
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reset manual changes flag when switching steps
    setHasManualChanges(false);
    // eslint-disable-next-line no-console
    console.log(`📍 Switched to step ${currentStep}, reset change flag`);
  }, [currentStep]);

  // Reactively check if current step has changes whenever relevant state updates
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("🔍 [Change Detection Effect] Running for step:", currentStep);

    // For curriculum and pricing, transform to API format before comparing
    const currentSnapshot = {
      1: normalizeForComparison(basicInfo),
      2: normalizeForComparison(transformCurriculumToAPI(curriculum)),
      3: normalizeForComparison(faqs),
      4: normalizeForComparison(transformPricingToAPI(pricing)),
      5: normalizeForComparison(finalize),
    }[currentStep];

    const savedSnapshot = {
      1: savedSnapshots.basicInfo,
      2: savedSnapshots.curriculum,
      3: savedSnapshots.faqs,
      4: savedSnapshots.pricing,
      5: savedSnapshots.finalize,
    }[currentStep];

    // eslint-disable-next-line no-console
    console.log("📊 Snapshots:", {
      currentSnapshotExists: !!currentSnapshot,
      savedSnapshotExists: !!savedSnapshot,
      currentLength: currentSnapshot?.length || 0,
      savedLength: savedSnapshot?.length || 0,
    });

    const hasChanges = currentSnapshot !== savedSnapshot;
    
    // eslint-disable-next-line no-console
    console.log(`🎯 [Change Detection] Step ${currentStep}:`, {
      hasChanges,
      buttonWillBeEnabled: hasChanges && !isDraft,
      isDraft,
      equal: currentSnapshot === savedSnapshot,
    });

    setCurrentStepHasChanges(hasChanges);

    if (hasChanges) {
      // eslint-disable-next-line no-console
      console.log("✅ Changes detected!");
      // eslint-disable-next-line no-console
      console.log("Current snapshot (first 200 chars):", currentSnapshot?.substring(0, 200));
      // eslint-disable-next-line no-console
      console.log("Saved snapshot (first 200 chars):", savedSnapshot?.substring(0, 200));
    } else {
      // eslint-disable-next-line no-console
      console.log("❌ No changes detected");
    }
  }, [currentStep, basicInfo, curriculum, faqs, pricing, finalize, savedSnapshots, isDraft]);

  // Helper function to check any step for changes (used in goToNext and other places)
  const hasStepChanges = React.useCallback((step: number): boolean => {
    // For curriculum and pricing, transform to API format before comparing
    const currentSnapshot = {
      1: normalizeForComparison(basicInfo),
      2: normalizeForComparison(transformCurriculumToAPI(curriculum)),
      3: normalizeForComparison(faqs),
      4: normalizeForComparison(transformPricingToAPI(pricing)),
      5: normalizeForComparison(finalize),
    }[step];

    const savedSnapshot = {
      1: savedSnapshots.basicInfo,
      2: savedSnapshots.curriculum,
      3: savedSnapshots.faqs,
      4: savedSnapshots.pricing,
      5: savedSnapshots.finalize,
    }[step];

    return currentSnapshot !== savedSnapshot;
  }, [basicInfo, curriculum, faqs, pricing, finalize, savedSnapshots]);

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
      // Check if current step has changes
      const stepHasChanges = hasStepChanges(currentStep);

      // For edit mode, only call API if there are changes
      // For draft mode, always call API
      const shouldCallAPI = isDraft || stepHasChanges;

      // Track if any changes were made (for edit mode)
      if (!isDraft && stepHasChanges) {
        setHasAnyChanges(true);
      }

      // Call API based on current step only if needed
      if (shouldCallAPI) {
        if (currentStep === 1) {
          await updateCourseDetails();
        } else if (currentStep === 2) {
          await updateCurriculum();
        } else if (currentStep === 3) {
          await updateFAQs();
        } else if (currentStep === 4) {
          await updatePricing();
        }
      }

      // Move to next step
      if (currentStep === 1) {
        setStep(2);
      } else if (currentStep === 2) {
        setStep(3);
      } else if (currentStep === 3) {
        setStep(4);
      } else if (currentStep === 4) {
        setStep(5);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("Step transition error:", err);
      // Error is already set in store and will be displayed in UI
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      // Clear any errors when navigating back
      useCourseStore.setState({ error: null, validationErrors: null });
      setStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
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
      // Reset store to clear all state
      useCourseStore.getState().resetStore();
      router.push("/instructor/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save draft.";
      // eslint-disable-next-line no-console
      console.error(errorMessage);
    }
  };

  const handlePublish = async () => {
    const ok = await finalizeRef.current?.validateAndFocus();
    if (!ok) return;

    try {
      await publishCourse();
      // eslint-disable-next-line no-console
      console.log("Course published successfully!");
      // Reset store to clear all state
      useCourseStore.getState().resetStore();
      router.push("/instructor/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to publish course.";
      // eslint-disable-next-line no-console
      console.error(errorMessage);
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

  const handleBackToHome = () => {
    // Navigate back to courses dashboard
    router.push("/instructor/courses");
  };

  // Removed handleSaveChanges - replaced by handleUpdateAndPublish functionality

  const handleUpdateAndPublish = async () => {
    // eslint-disable-next-line no-console
    console.log("💾 Update & Publish clicked! Validating and saving...");

    // Validate and sync current step to store
    let ok = true;
    if (currentStep === 1) {
      ok = (await detailsRef.current?.validateAndFocus()) ?? false;
      // For Step 1, we need to manually sync form data to store since Formik doesn't auto-sync
      if (ok && detailsRef.current?.getValues) {
        const values = detailsRef.current.getValues();
        // eslint-disable-next-line no-console
        console.log("📝 Step 1 form values to sync:", values);
        
        // Sync to store
        const learningPoints = values.learningPoints
          .filter((item) => item.text.trim().length > 0)
          .map((item) => ({ description: item.text }));
        const requirements = values.requirements
          .filter((item) => item.text.trim().length > 0)
          .map((item) => item.text);
        const whoThisCourseIsFor = values.whoThisCourseIsFor
          .filter((item) => item.text.trim().length > 0)
          .map((item) => item.text);

        useCourseStore.getState().setBasicInfo({
          title: values.courseTitle,
          categoryId: values.selectedCategory,
          learningLevel: values.learningLevel,
          description: values.shortDescription,
          shortDescription: values.shortDescription,
          fullDescription: values.fullDescription,
          language: "English",
          learningPoints,
          requirements,
          whoThisCourseIsFor,
          targetAudience: whoThisCourseIsFor,
          tags: [],
          certificateDescription: values.certificateDescription || "",
          promoVideoId: values.promoVideoId,
          courseBannerId: values.courseBannerId,
        });
      }
    }
    if (currentStep === 2)
      ok = (await curriculumRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 3)
      ok = (await faqsRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 4)
      ok = (await priceRef.current?.validateAndFocus()) ?? false;
    if (currentStep === 5)
      ok = (await finalizeRef.current?.validateAndFocus()) ?? false;
    
    if (!ok) {
      // eslint-disable-next-line no-console
      console.log("❌ Validation failed");
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log("✅ Validation passed, calling API...");

      // Call API based on current step (always save since user clicked Update & Publish)
      if (currentStep === 1) {
        await updateCourseDetails();
      } else if (currentStep === 2) {
        await updateCurriculum();
      } else if (currentStep === 3) {
        await updateFAQs();
      } else if (currentStep === 4) {
        await updatePricing();
      } else if (currentStep === 5) {
        // Step 5: Finalize - use publishCourse API to update welcome/congratulation messages
        await publishCourse();
      }

      // eslint-disable-next-line no-console
      console.log("✅ Changes saved successfully!");

      // Navigate back to dashboard
      useCourseStore.getState().resetStore();
      router.push("/instructor/courses");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save changes.";
      // eslint-disable-next-line no-console
      console.error("❌ Save failed:", errorMessage);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-16 mx-auto border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading course data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-default-900">
            Failed to Load Course
          </h2>
          <p className="text-muted-foreground">{loadError}</p>
          <Button onClick={() => router.push("/instructor/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

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
          {isDraft ? "Complete Your Draft Course" : "Edit Course"}
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
                  // Clear errors when navigating to a different step
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
          <div onChange={markAsChanged} onInput={markAsChanged}>
            {currentStep === 1 ? (
              <CourseDetails
                key={formsKey}
                ref={detailsRef}
                onPreview={handlePreview}
              />
            ) : currentStep === 2 ? (
              <Curriculum
                key={formsKey}
                ref={curriculumRef}
                onPreview={handlePreview}
              />
            ) : currentStep === 3 ? (
              <FAQs key={formsKey} ref={faqsRef} onPreview={handlePreview} />
            ) : currentStep === 4 ? (
              <Price key={formsKey} ref={priceRef} onPreview={handlePreview} />
            ) : (
              <Finalize key={formsKey} ref={finalizeRef} />
            )}
          </div>

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
                  {/* Draft mode: always show save options */}
                  {isDraft ? (
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
                        {loading.publishCourse
                          ? "Publishing..."
                          : "Save & Publish"}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Edit mode: show Update & Publish button like other steps */}
                      {/* eslint-disable-next-line no-console */}
                      {console.log("🔘 [Button Render - Final Step]", {
                        isDraft,
                        currentStep,
                        hasManualChanges,
                        buttonWillBeEnabled: hasManualChanges,
                      })}
                      <Button
                        variant="outline"
                        onClick={handleBackToHome}
                        disabled={loading.publishCourse}
                      >
                        Back to Home
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleUpdateAndPublish}
                        disabled={
                          !hasManualChanges ||
                          loading.publishCourse
                        }
                        className="gap-2"
                        title={
                          !hasManualChanges
                            ? "No changes to save"
                            : "Save changes and return to dashboard"
                        }
                      >
                        {loading.publishCourse
                          ? "Updating..."
                          : "Update & Publish"}
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Show Update and Publish button only in Edit mode (not Draft) */}
                  {!isDraft ? (
                    <>
                      {/* eslint-disable-next-line no-console */}
                      {console.log("🔘 [Button Render]", {
                        isDraft,
                        currentStep,
                        hasManualChanges,
                        currentStepHasChanges,
                        buttonWillBeEnabled: hasManualChanges && !isUploadingAssets,
                        isUploadingAssets,
                      })}
                      <Button
                        variant="default"
                        onClick={handleUpdateAndPublish}
                        disabled={
                          !hasManualChanges ||
                          loading.updateCourseDetails ||
                          loading.updateCurriculum ||
                          loading.updateFAQs ||
                          loading.updatePricing ||
                          isUploadingAssets
                        }
                        className="gap-2"
                        title={
                          !hasManualChanges
                            ? "No changes to save"
                            : isUploadingAssets
                              ? "Please wait for assets to finish uploading"
                              : "Save changes and return to dashboard"
                        }
                      >
                        {loading.updateCourseDetails ||
                        loading.updateCurriculum ||
                        loading.updateFAQs ||
                        loading.updatePricing
                          ? "Updating..."
                          : "Update & Publish"}
                      </Button>
                    </>
                  ) : null}
                  
                  <div className="relative">
                    <Button
                      onClick={goToNext}
                      className="gap-2"
                      disabled={
                        loading.updateCourseDetails ||
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
                      {loading.updateCourseDetails ||
                      loading.updateCurriculum ||
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
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
