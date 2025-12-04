"use client";

import { create } from "zustand";
import type { CourseStore, CreateCourseRequest, PricingRequest, Category, UICurriculum, UIPricing, CurriculumRequest, LectureResource } from "@/types/course";
import { getCategories } from "@/app/api/course/getCategories";
import { createCourse as createCourseApi } from "@/app/api/course/createCourse";
import { updateCourseDetails as updateCourseDetailsApi } from "@/app/api/course/updateCourseDetails";
import { updateCurriculum as updateCurriculumApi } from "@/app/api/course/updateCurriculum";
import { updatePricing as updatePricingApi } from "@/app/api/course/updatePricing";
import { saveDraft as saveDraftApi } from "@/app/api/course/saveDraft";
import { publishCourse as publishCourseApi } from "@/app/api/course/publishCourse";
import { 
  addFAQs as addFAQsApi, 
  updateFAQs as updateFAQsApi, 
  getFAQs as getFAQsApi, 
  deleteFAQ, 
  type FAQ 
} from "@/app/api/instructor/faqs";
import { extractErrorMessage } from "@/lib/errorUtils";

const initialBasicInfo: CreateCourseRequest = {
  title: "",
  categoryId: "",
  learningLevel: "",
  description: "",
  fullDescription: "",
  language: "",
  promoVideoId: null,
  courseBannerId: null,
  courseLogoId: null,
  learningPoints: [],
  requirements: [],
  targetAudience: [],
  tags: [],
};

const initialUICurriculum: UICurriculum = {
  sections: [],
};

const initialPricing: UIPricing = {
  price: 0,
  currency: "USD",
  isFree: false,
  discountPercent: null,
  priceTier: "free",
};

// Transform UI pricing to API format
export function transformPricingToAPI(uiPricing: UIPricing): PricingRequest {
  // Calculate amount (final price after discount)
  let amount = uiPricing.isFree ? 0 : uiPricing.price;
  const originalAmount = uiPricing.price; // Original price before discount
  const discountPercentage = uiPricing.discountPercent || 0;
  
  // Apply discount if applicable
  if (discountPercentage > 0 && amount > 0) {
    amount = originalAmount * (1 - discountPercentage / 100);
  }
  
  // Determine priceTier based on selected tier or price
  let priceTier = uiPricing.priceTier || "free";
  if (uiPricing.isFree || amount === 0) {
    priceTier = "free";
  } else if (priceTier === "custom") {
    // For custom prices, keep as "custom" or map to a specific tier
    priceTier = "custom";
  }

  return {
    currency: uiPricing.currency,
    amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    originalAmount: Math.round(originalAmount * 100) / 100,
    discountPercentage: Math.round(discountPercentage * 100) / 100,
    priceTier: String(priceTier), // Ensure it's a string
  };
}

// Transform UI curriculum to API format
export function transformCurriculumToAPI(uiCurriculum: UICurriculum): CurriculumRequest {
  let totalDuration = 0;

  const apiSections = uiCurriculum.sections.map((section, sectionIndex) => {
    const apiLectures = section.lectures.map((lecture, lectureIndex) => {
      const duration = lecture.duration || 15; // default 15 minutes if not set
      totalDuration += duration;

      // Handle both Formik format (name, video, isPreview) and store format (title, videoId, isFree)
      const lectureTitle = "title" in lecture ? lecture.title : (lecture as { name: string }).name;
      const videoId = "videoId" in lecture 
        ? (lecture.videoId || 0) 
        : parseInt((lecture as { video: string }).video, 10) || 0;
      const isPreview = "isFree" in lecture 
        ? lecture.isFree 
        : (lecture as { isPreview?: boolean }).isPreview ?? false;

      // Parse resources - handle multiple formats
      const resources: LectureResource[] = [];
      if ("resources" in lecture && lecture.resources) {
        try {
          let resourceData: unknown = lecture.resources;
          
          // If it's an array of objects with fileId (from store format)
          if (Array.isArray(resourceData) && resourceData.length > 0 && "fileId" in resourceData[0]) {
            resources.push(...resourceData.map(r => ({
              assetId: r.fileId,
              name: r.title || "",
              type: "file"
            })));
          }
          // If it's an array of UploadedFile objects (from form with fileName)
          else if (Array.isArray(resourceData) && resourceData.length > 0 && "fileName" in resourceData[0]) {
            resources.push(...resourceData.map(r => {
              // Extract file extension from fileName
              const fileName = r.fileName || "";
              const lastDotIndex = fileName.lastIndexOf(".");
              const fileExtension = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1) : "file";
              
              return {
                assetId: r.assetId,
                name: fileName,
                type: fileExtension
              };
            }));
          }
          // If it's a string (from Formik format)
          else if (typeof resourceData === "string") {
            resourceData = JSON.parse(resourceData);
            if (Array.isArray(resourceData)) {
              resources.push(...resourceData.filter((r): r is LectureResource => 
                r && typeof r === "object" && "assetId" in r
              ));
            } else if (resourceData && typeof resourceData === "object" && "assetId" in resourceData) {
              resources.push(resourceData as LectureResource);
            }
          }
          // If it's an array of LectureResource objects (already in correct format)
          else if (Array.isArray(resourceData)) {
            resources.push(...resourceData.filter((r): r is LectureResource => 
              r && typeof r === "object" && "assetId" in r && "name" in r && "type" in r
            ));
          } else if (resourceData && typeof resourceData === "object" && "assetId" in resourceData) {
            resources.push(resourceData as LectureResource);
          }
        } catch {
          // If parsing fails, ignore resources
        }
      }

      return {
        title: lectureTitle,
        description: lecture.description,
        videoId,
        duration,
        order: lectureIndex + 1,
        isPreview,
        resources,
      };
    });

    // Handle both Formik format (name) and store format (title)
    const sectionTitle = "title" in section ? section.title : (section as { name: string }).name;

    return {
      title: sectionTitle,
      description: section.description,
      order: sectionIndex + 1,
      lectures: apiLectures,
    };
  });

  // Calculate stats
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;
  const totalDurationFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  
  const stats = {
    totalDurationFormatted,
    totalExercises: "0", // TODO: Calculate from exercises if available
    totalProjects: "0", // TODO: Calculate from projects if available
  };

  return {
    sections: apiSections,
    stats,
  };
}

// Restore courseId from localStorage on initialization
const getStoredCourseId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem("course_creation_courseId") || undefined;
  } catch {
    return undefined;
  }
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  step: 1,
  courseId: getStoredCourseId(),
  basicInfo: initialBasicInfo,
  curriculum: initialUICurriculum,
  faqs: [],
  pricing: initialPricing,
  finalize: {
    welcomeMessage: "",
    congratulationMessage: "",
  },
  validationErrors: null,
  isDraft: true,
  isPublished: false,
  saved: {
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  },
  savedSnapshots: {
    basicInfo: "",
    curriculum: "",
    faqs: "",
    pricing: "",
    finalize: "",
  },
  loading: {
    categories: false,
    createCourse: false,
    updateCourseDetails: false,
    updateCurriculum: false,
    updateFAQs: false,
    updatePricing: false,
    saveDraft: false,
    publishCourse: false,
  },
  uploading: {
    promoVideo: false,
    coverBanner: false,
    curriculum: false,
  },
  error: null,

  setBasicInfo: (info) => set((state) => ({ basicInfo: { ...state.basicInfo, ...info } })),
  setCurriculum: (curriculum) => set((state) => ({ curriculum: { ...state.curriculum, ...curriculum } as UICurriculum })), // UI structure - will be transformed on API call
  setFAQs: (faqs) => set({ faqs }),
  setPricing: (pricing) => set((state) => ({ pricing: { ...state.pricing, ...pricing } as UIPricing })),
  setFinalize: (finalize) => set((state) => ({ finalize: { ...state.finalize, ...finalize } })),
  setUploading: (uploading) => set((state) => ({ uploading: { ...state.uploading, ...uploading } })),
  clearValidationErrors: () => set({ validationErrors: null }),

  fetchCategories: async (): Promise<Category[]> => {
    set((state) => ({ loading: { ...state.loading, categories: true }, error: null }));
    try {
      const categories = await getCategories();
      set((state) => ({ loading: { ...state.loading, categories: false }, error: null }));
      return categories;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({ loading: { ...state.loading, categories: false }, error: errorMessage }));
      throw error;
    }
  },

  createCourse: async (payload) => {
    const state = get();
    const body: CreateCourseRequest = { ...state.basicInfo, ...(payload ?? {}) } as CreateCourseRequest;
    const currentSnapshot = JSON.stringify(body);
    
    // Check if data has changed since last save
    const hasChanged = currentSnapshot !== state.savedSnapshots.basicInfo;
    
    // If no changes and courseId exists, just move to next step
    if (!hasChanged && state.courseId) {
      set({ step: 2 });
      return state.courseId;
    }

    set((s) => ({ loading: { ...s.loading, createCourse: true }, error: null }));
    try {
      const { courseId: existingCourseId } = state;
      let courseId = existingCourseId;
      
      // If courseId exists, UPDATE; otherwise CREATE
      if (courseId) {
        await updateCourseDetailsApi(courseId, body);
        // eslint-disable-next-line no-console
        console.log("Course details updated for ID:", courseId);
      } else {
        const response = await createCourseApi(body);
        courseId = response?.id;
        
        if (!courseId || typeof courseId !== "string") {
          throw new Error("Invalid course ID received from API");
        }
        
        // Persist courseId to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("course_creation_courseId", courseId);
        }
        
        // eslint-disable-next-line no-console
        console.log("Course created with ID:", courseId);
      }

      // Update saved snapshot
      set((s) => ({
        courseId,
        saved: { ...s.saved, step1: true },
        savedSnapshots: { ...s.savedSnapshots, basicInfo: currentSnapshot },
        loading: { ...s.loading, createCourse: false },
        step: 2,
      }));
      
      return courseId;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      const errorObj = error as { validationErrors?: Record<string, string> | null };
      const validationErrors = errorObj.validationErrors || null;
      set((s) => ({ 
        loading: { ...s.loading, createCourse: false }, 
        error: errorMessage,
        validationErrors 
      }));
      throw error;
    }
  },

  updateCourseDetails: async () => {
    const state = get();
    
    // Get courseId from store or localStorage
    const { courseId: storeCourseId } = state;
    let courseId = storeCourseId;
    if (!courseId && typeof window !== "undefined") {
      courseId = localStorage.getItem("course_creation_courseId") || undefined;
    }
    
    // Validate courseId
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      const errorObj = new Error("Course ID is missing. Cannot update course details.");
      set((_s) => ({ error: errorObj.message }));
      throw errorObj;
    }
    
    // Ensure courseId is in store
    if (!state.courseId || state.courseId !== courseId) {
      set({ courseId });
    }
    
    const body: CreateCourseRequest = state.basicInfo;
    const currentSnapshot = JSON.stringify(body);
    
    // Check if data has changed since last save
    const hasChanged = currentSnapshot !== state.savedSnapshots.basicInfo;
    
    // If no changes, skip API call
    if (!hasChanged && state.saved.step1) {
      return;
    }

    set((s) => ({ loading: { ...s.loading, updateCourseDetails: true }, error: null }));
    try {
      await updateCourseDetailsApi(courseId, body);
      set((s) => ({ 
        saved: { ...s.saved, step1: true },
        savedSnapshots: { ...s.savedSnapshots, basicInfo: currentSnapshot },
        loading: { ...s.loading, updateCourseDetails: false }
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      const errorObj = error as { validationErrors?: Record<string, string> };
      const validationErrors = errorObj.validationErrors || null;
      set((s) => ({ 
        loading: { ...s.loading, updateCourseDetails: false }, 
        error: errorMessage,
        validationErrors 
      }));
      throw error;
    }
  },

  updateCurriculum: async () => {
    const state = get();
    
    // Get courseId from store or localStorage
    const { courseId: storeCourseId } = state;
    let courseId = storeCourseId;
    if (!courseId && typeof window !== "undefined") {
      courseId = localStorage.getItem("course_creation_courseId") || undefined;
    }
    
    // Validate courseId
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      const errorObj = new Error("Course ID is missing. Please complete Step 1 first.");
      set((_s) => ({ error: errorObj.message }));
      // eslint-disable-next-line no-console
      console.error("Course ID validation failed:", { courseId, storeCourseId: state.courseId });
      throw errorObj;
    }
    
    // Ensure courseId is in store
    if (!state.courseId || state.courseId !== courseId) {
      set({ courseId });
    }
    
    // Transform UI curriculum to API format
    const apiPayload = transformCurriculumToAPI(state.curriculum);
    const currentSnapshot = JSON.stringify(apiPayload);
    
    // Check if data has changed since last save
    const hasChanged = currentSnapshot !== state.savedSnapshots.curriculum;
    
    // If no changes, just move to next step
    if (!hasChanged) {
      // eslint-disable-next-line no-console
      console.log("✓ Curriculum unchanged - skipping API call");
      set({ step: 3 });
      return;
    }

    // eslint-disable-next-line no-console
    console.log("✏️ Curriculum changed - calling API to update course:", courseId);

    set((s) => ({ loading: { ...s.loading, updateCurriculum: true }, error: null }));
    try {
      await updateCurriculumApi(courseId, apiPayload);
      set((s) => ({ 
        saved: { ...s.saved, step2: true },
        savedSnapshots: { ...s.savedSnapshots, curriculum: currentSnapshot },
        loading: { ...state.loading, updateCurriculum: false }, 
        step: 3 // Move to FAQs step
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      const errorObj = error as { validationErrors?: Record<string, string> };
      const validationErrors = errorObj.validationErrors || null;
      set((_state) => ({ 
        loading: { ...state.loading, updateCurriculum: false }, 
        error: errorMessage,
        validationErrors 
      }));
      throw error;
    }
  },

  updateFAQs: async () => {
    const state = get();
    
    // Get courseId from store or localStorage
    const { courseId: storeCourseId } = state;
    let courseId = storeCourseId;
    if (!courseId && typeof window !== "undefined") {
      courseId = localStorage.getItem("course_creation_courseId") || undefined;
    }
    
    // Validate courseId
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      const errorObj = new Error("Course ID is missing. Please complete Step 1 first.");
      set((_s) => ({ error: errorObj.message }));
      throw errorObj;
    }
    
    // Ensure courseId is in store
    if (!state.courseId || state.courseId !== courseId) {
      set({ courseId });
    }
    
    // Get FAQs from store
    const faqs = state.faqs || [];
    
    // Prepare FAQs for API - separate new FAQs from existing ones
    const newFAQs = faqs.filter((f) => !f.faqId || f.faqId.startsWith("temp-"));
    const existingFAQs = faqs.filter((f) => f.faqId && !f.faqId.startsWith("temp-"));
    
    const currentSnapshot = JSON.stringify(faqs);
    
    // Check if data has changed since last save
    const hasChanged = currentSnapshot !== state.savedSnapshots.faqs;
    
    // If no changes, just move to next step
    if (!hasChanged) {
      // eslint-disable-next-line no-console
      console.log("✓ FAQs unchanged - skipping API call");
      set({ step: 4 }); // Move to Price step
      return;
    }

    set((s) => ({ loading: { ...s.loading, updateFAQs: true }, error: null }));
    try {
      // eslint-disable-next-line no-console
      console.log("✏️ FAQs changed - calling API to update. Sending:", faqs);
      
      // If there are existing FAQs, update them; otherwise add new ones
      if (existingFAQs.length > 0) {
        // Update existing FAQs
        const updatePayload = existingFAQs.map((f) => ({
          faq_id: f.faqId,
          question: f.question,
          answer: f.answer,
        }));
        await updateFAQsApi(courseId, updatePayload);
      }
      
      // Add new FAQs if any
      if (newFAQs.length > 0) {
        const addPayload = newFAQs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }));
        await addFAQsApi(courseId, addPayload);
      }
      
      // Fetch updated FAQs to get the IDs
      const updatedFAQs = await getFAQsApi(courseId);
      
      set((s) => ({ 
        saved: { ...s.saved, step3: true },
        savedSnapshots: { ...s.savedSnapshots, faqs: currentSnapshot },
        faqs: updatedFAQs,
        loading: { ...s.loading, updateFAQs: false }, 
        step: 4 // Move to Price step
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      const errorObj = error as { validationErrors?: Record<string, string> };
      const validationErrors = errorObj.validationErrors || null;
      set((_state) => ({ 
        loading: { ...state.loading, updateFAQs: false }, 
        error: errorMessage,
        validationErrors 
      }));
      throw error;
    }
  },

  updatePricing: async () => {
    const state = get();
    
    // Get courseId from store or localStorage
    const { courseId: storeCourseId } = state;
    let courseId = storeCourseId;
    if (!courseId && typeof window !== "undefined") {
      courseId = localStorage.getItem("course_creation_courseId") || undefined;
    }
    
    // Validate courseId
    if (!courseId || typeof courseId !== "string" || courseId.trim() === "") {
      const errorObj = new Error("Course ID is missing. Please complete Step 1 first.");
      set((_s) => ({ error: errorObj.message }));
      throw errorObj;
    }
    
    // Ensure courseId is in store
    if (!state.courseId || state.courseId !== courseId) {
      set({ courseId });
    }
    
    // Transform UI pricing structure to API format
    const apiPricing = transformPricingToAPI(state.pricing);
    const currentSnapshot = JSON.stringify(apiPricing);
    
    // Check if data has changed since last save
    const hasChanged = currentSnapshot !== state.savedSnapshots.pricing;
    
    // If no changes, just move to next step
    if (!hasChanged) {
      // eslint-disable-next-line no-console
      console.log("✓ Pricing unchanged - skipping API call");
      set({ step: 5 }); // Move to Finalize step
      return;
    }

    set((s) => ({ loading: { ...s.loading, updatePricing: true }, error: null }));
    try {
      // eslint-disable-next-line no-console
      console.log("✏️ Pricing changed - calling API to update. Sending:", apiPricing);
      
      await updatePricingApi(courseId, apiPricing);
      set((s) => ({ 
        saved: { ...s.saved, step4: true },
        savedSnapshots: { ...s.savedSnapshots, pricing: currentSnapshot },
        loading: { ...s.loading, updatePricing: false }, 
        step: 5 // Move to Finalize step
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      const errorObj = error as { validationErrors?: Record<string, string> | null };
      const validationErrors = errorObj.validationErrors || null;
      set((s) => ({ 
        loading: { ...s.loading, updatePricing: false }, 
        error: errorMessage,
        validationErrors 
      }));
      throw error;
    }
  },

  setStep: (step) => {
    set({ step, error: null, validationErrors: null });
  },

  saveDraft: async () => {
    const { courseId, finalize } = get();
    if (!courseId) throw new Error("Course ID is missing");
    
    // Validate that finalize messages are provided for draft
    if (!finalize?.welcomeMessage || !finalize?.congratulationMessage) {
      throw new Error("Welcome and congratulation messages are required for saving draft");
    }
    
    set((state) => ({ loading: { ...state.loading, saveDraft: true }, error: null }));
    try {
      await saveDraftApi(courseId, {
        isDraft: true,
        welcomeMessage: finalize.welcomeMessage,
        congratulationMessage: finalize.congratulationMessage,
      });
      set((state) => ({ loading: { ...state.loading, saveDraft: false }, isDraft: true, error: null }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({ loading: { ...state.loading, saveDraft: false }, error: errorMessage }));
      throw error;
    }
  },

  publishCourse: async () => {
    const { courseId, finalize } = get();
    if (!courseId) throw new Error("Course ID is missing");
    set((state) => ({ loading: { ...state.loading, publishCourse: true }, error: null }));
    try {
      // Include finalize messages in publish (optional - backend may already have them from draft)
      await publishCourseApi(courseId, {
        isDraft: false,
        welcomeMessage: finalize?.welcomeMessage || undefined,
        congratulationMessage: finalize?.congratulationMessage || undefined,
      });
      set((state) => ({ loading: { ...state.loading, publishCourse: false }, isDraft: false, isPublished: true, error: null }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({ loading: { ...state.loading, publishCourse: false }, error: errorMessage }));
      throw error;
    }
  },

  resetStore: () => {
    // Clear state
    set({
      basicInfo: initialBasicInfo,
      curriculum: initialUICurriculum,
      faqs: [],
      pricing: initialPricing,
      finalize: {
        welcomeMessage: "",
        congratulationMessage: "",
      },
      step: 1,
      saved: { step1: false, step2: false, step3: false, step4: false },
      savedSnapshots: { basicInfo: "", curriculum: "", faqs: "", pricing: "", finalize: "" },
      courseId: undefined,
      loading: {
        categories: false,
        createCourse: false,
        updateCourseDetails: false,
        updateCurriculum: false,
        updateFAQs: false,
        updatePricing: false,
        saveDraft: false,
        publishCourse: false,
      },
      uploading: {
        promoVideo: false,
        coverBanner: false,
        curriculum: false,
      },
      error: null,
      validationErrors: null,
      isDraft: false,
      isPublished: false,
    });
    
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("course_creation_courseId");
    }
  },
}));

export type { CourseStore };


