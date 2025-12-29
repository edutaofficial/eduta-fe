export interface Category {
  categoryId: string;
  name: string;
}

export interface Asset {
  asset_id: number;
  user_id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_extension: string;
  presigned_url?: string; // S3 presigned URL for secure access
}

// UI structure (for form)
export interface Lecture {
  id: number | string;
  name: string;
  description: string;
  video: string; // asset id as string
  resources?: string | null;
  duration?: number; // in minutes
  isPreview?: boolean;
}

export interface Section {
  id: number | string;
  name: string;
  description: string;
  lectures: Lecture[];
}

// API structure (what the backend expects)
export interface LectureResource {
  assetId: number;
  name: string;
  type: string;
}

export interface ApiLecture {
  title: string;
  description: string;
  videoId: number;
  duration: number;
  order: number;
  isPreview: boolean;
  resources: LectureResource[];
}

export interface ApiSection {
  title: string;
  description: string;
  order: number;
  lectures: ApiLecture[];
}

export interface CurriculumStats {
  totalDurationFormatted: string;
  totalExercises: string;
  totalProjects: string;
}

export interface CurriculumRequest {
  sections: ApiSection[];
  stats: CurriculumStats;
}

export interface Course {
  id: string;
  title: string;
  categoryId: string;
  learningLevel: string;
  description: string;
  fullDescription: string;
  language: string;
  promoVideoId?: number | null;
  courseBannerId?: number | null;
  courseLogoId?: number | null;
  learningPoints: { description: string }[];
  requirements: string[];
  targetAudience: string[];
  tags: string[];
}

// UI basic info format (for form and editing)
export interface UIBasicInfo {
  title: string;
  shortDescription: string;
  description: string;
  learningLevel: string;
  language: string;
  categoryId: string;
  courseLogoId?: number | null;
  courseBannerId?: number | null;
  promoVideoId?: number | null;
  certificateDescription?: string;
  learningPoints: Array<{ id: string; text: string }>;
  targetAudiences: Array<{ id: string; text: string }>;
  prerequisites: Array<{ id: string; text: string }>;
}

// UI pricing format (for form)
export interface UIPricing {
  price: number;
  currency: string;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  isFree?: boolean;
  discountPercent?: number | null;
  priceTier?: string;
}

// API pricing format (what the backend expects)
export interface PricingRequest {
  currency: string;
  amount: number;
  originalAmount: number;
  discountPercentage: number;
  priceTier: string;
}

export interface DraftRequest {
  isDraft: boolean;
}

// API Response structure for getCourseById and getCourseForEdit
export interface CourseDetailApiResponse {
  success: boolean;
  message: string;
  data: {
    courseId: string;
    status: string;
    currentStep: number;
    courseDetails: {
      title: string;
      categoryId: string;
      learningLevel: string;
      description: string;
      fullDescription: string;
      language: string;
      promoVideoId: number | null;
      courseBannerId: number | null;
      courseLogoId: number | null;
      certificateDescription?: string;
      learningPoints: Array<{
        learningPointId: string;
        description: string;
        displayOrder: number;
      }>;
      requirements: Array<{
        requirementId?: string;
        description: string;
        displayOrder?: number;
      }>;
      targetAudience: Array<{
        audienceId?: string;
        description: string;
        displayOrder?: number;
      }>;
      tags: Array<{
        tagId?: string;
        tagName?: string;
      }>;
    };
    curriculum: {
      sections: Array<{
        sectionId: string;
        title: string;
        description: string;
        displayOrder: number;
        lectureCount: number;
        totalDuration: number;
        lectures: Array<{
          lectureId: string;
          title: string;
          description: string;
          videoId: number | null;
          duration: number;
          durationFormatted: string;
          displayOrder: number;
          isPreview: boolean;
          resources: Array<{
            resourceId: string;
            assetId: number;
            resourceName: string;
            resourceType: string;
            displayOrder: number;
          }>;
        }>;
      }>;
    };
    pricing: {
      pricingId: string;
      currency: string;
      amount: number;
      originalAmount: number | null;
      discountPercentage: number;
      priceTier: string;
    };
    finalize: {
      welcomeMessage: string | null;
      congratulationMessage: string | null;
    };
  };
}

export interface CreateCourseRequest {
  title: string;
  categoryId: string;
  learningLevel: string;
  description: string;
  shortDescription?: string;
  fullDescription: string;
  language: string;
  promoVideoId?: number | null;
  courseBannerId?: number | null;
  courseLogoId?: number | null;
  learningPoints: { description: string }[];
  requirements: string[];
  targetAudience: string[];
  whoThisCourseIsFor?: string[];
  certificateDescription?: string;
  tags: string[];
}

// UI curriculum format (what we store in Zustand and use for editing)
export interface UICurriculum {
  sections: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lectures: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
      duration: number;
      isFree: boolean;
      videoId: number | null;
      resources: Array<{
        id: string;
        title: string;
        fileId: number;
      }>;
    }>;
  }>;
}

export interface CourseState {
  step: 1 | 2 | 3 | 4 | 5;
  courseId?: string;
  basicInfo: CreateCourseRequest;
  curriculum: UICurriculum; // UI format - transformed to API format on send
  faqs?: Array<{ faqId: string; question: string; answer: string }>; // FAQs for the course
  pricing: UIPricing; // UI format - transformed to API format on send
  finalize?: {
    welcomeMessage?: string;
    congratulationMessage?: string;
  };
  isDraft?: boolean;
  isPublished?: boolean;
  
  // Track what's been saved to avoid duplicate API calls
  saved: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };

  // Snapshots of last saved data to detect changes
  savedSnapshots: {
    basicInfo: string; // JSON stringified
    curriculum: string; // JSON stringified
    faqs: string; // JSON stringified
    pricing: string; // JSON stringified
    finalize: string; // JSON stringified
  };

  loading: {
    categories: boolean;
    createCourse: boolean;
    updateCourseDetails: boolean;
    updateCurriculum: boolean;
    updateFAQs: boolean;
    updatePricing: boolean;
    saveDraft: boolean;
    publishCourse: boolean;
  };
  uploading: {
    promoVideo: boolean;
    coverBanner: boolean;
    curriculum: boolean; // Track if any curriculum video is uploading
  };
  error?: string | null;
  validationErrors?: Record<string, string> | null; // Field-level validation errors from API
}

export interface CourseActions {
  setStep: (step: CourseState["step"]) => void;
  setBasicInfo: (info: Partial<CreateCourseRequest>) => void;
  setCurriculum: (curriculum: Partial<UICurriculum>) => void;
  setFAQs: (faqs: Array<{ faqId: string; question: string; answer: string }>) => void;
  setPricing: (pricing: Partial<UIPricing>) => void;
  setFinalize: (finalize: Partial<CourseState["finalize"]>) => void;
  setUploading: (uploading: Partial<CourseState["uploading"]>) => void;
  clearValidationErrors: () => void;

  fetchCategories: () => Promise<Category[]>;
  createCourse: (payload?: Partial<CreateCourseRequest>) => Promise<string>; // returns courseId
  updateCourseDetails: () => Promise<void>;
  updateCurriculum: () => Promise<void>;
  updateFAQs: () => Promise<void>;
  updatePricing: () => Promise<void>;
  saveDraft: () => Promise<void>;
  publishCourse: () => Promise<void>;
  resetStore: () => void;
}

export type CourseStore = CourseState & CourseActions;

// Public Courses Search
export interface PublicCourse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  courseBannerId: number | null;
  courseBannerUrl: string | null;
  learningLevel: string;
  language: string;
  instructor: {
    instructorId: number;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  category: {
    categoryId: string;
    name: string;
    slug: string;
  };
  pricing: {
    currency: string;
    amount: string;
    originalAmount: string;
    discountPercentage: number;
  } | null;
  stats: {
    totalStudents: number;
    totalLectures: number;
    totalDurationFormatted: string;
    avgRating: string;
    totalReviews: number;
    viewsCount: number;
  };
  createdAt: string;
}


