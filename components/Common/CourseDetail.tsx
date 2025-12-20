"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CONSTANTS } from "@/lib/constants";
import {
  CheckIcon,
  VideoIcon,
  StarIcon,
  PlayIcon,
  HeartIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  LockIcon, 
  ClockIcon,
  DownloadIcon,
  InfinityIcon,
  AwardIcon,
  Share2Icon,
  UsersIcon,
  MessageSquareIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCourseStore } from "@/store/useCourseStore";
import FAQComponent from "../Home/FAQ";
import { useAuth } from "@/lib/context/AuthContext";
import { useUpload } from "@/hooks/useUpload";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { useQuery } from "@tanstack/react-query";
import { getInstructorProfile } from "@/app/api/instructor/getInstructorProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { createLectureUrl } from "@/lib/slugify";

import type { CourseDetail as CourseDetailAPI } from "@/app/api/course/getCourseDetail";
import type { CourseReview } from "@/app/api/learner/reviews";

interface CourseDetailProps {
  courseId?: string;
  isPreview?: boolean;
  onBack?: () => void;
  courseData?: CourseDetailAPI;
  isWishlisted?: boolean;
  onEnroll?: () => void;
  onWishlistToggle?: () => void;
  enrolling?: boolean;
  wishlistLoading?: boolean;
  reviews?: CourseReview[];
  averageRating?: number;
  totalReviews?: number;
  onWriteReview?: () => void;
}

interface CourseData {
  id?: string;
  category?: string;
  parentCategory?: string;
  subCategory?: string;
  title: string;
  subHeading?: string;
  duration?: string;
  viewsCount?: number;
  rating?: number;
  ratingCount?: number;
  enrollments?: number;
  requirements?: string[];
  learningPoints: string[];
  whoThisCourseIsFor?: {description: string}[];
  certificateDescription?: string;
  description: string;
  updatedAt?: string;
  outline?: Array<{
    id: string;
    title: string;
    lectures: Array<{
      id: string;
      title: string;
      duration?: string | number;
      isPreview?: boolean;
      videoId?: number;
    }>;
  }>;
  promoVideo?: string | number | null;
  instructor?: {
    id?: number;
    name: string;
    title: string;
    bio: string;
    avatar?: string | number | null;
    rating?: number;
    studentCount?: number;
    courseCount?: number;
  };
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
  }>;
}

// Helper to format duration from minutes to "X hours" or "Xm"
function formatDuration(totalMinutes?: number): string {
  if (!totalMinutes) return "0 hours";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

// Helper to format lecture duration
function formatLectureDuration(duration?: string | number): string {
  if (!duration) return "0m";
  if (typeof duration === "number") {
    // Duration is always in minutes
    return `${duration}m`;
  }
  return duration; // Already formatted string
}

// Helper to format total minutes into "X hours" label for side card
function formatHoursLabel(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "Video length coming soon";
  if (totalMinutes < 60) {
    const mins = Math.max(1, Math.round(totalMinutes));
    return `${mins} min video lectures`;
  }
  const hours = totalMinutes / 60;
  const value = hours >= 1 ? hours.toFixed(1).replace(/\.0$/, "") : hours.toFixed(1);
  return `${value} hours video lectures`;
}

// Clamp short description to 500 characters for display
function truncateShortDescription(text?: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= 500) return trimmed;
  return `${trimmed.slice(0, 500)}...`;
}

// ReviewCard component with show more/less functionality
function ReviewCard({ review }: { review: CourseReview }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Calculate if review text is long (more than approximately 4-5 lines)
  // Assuming average line length of ~80 characters, 4-5 lines ≈ 320-400 characters
  const CHARACTER_LIMIT = 350;
  const isLongReview = review.reviewText && review.reviewText.length > CHARACTER_LIMIT;
  
  const displayText = React.useMemo(() => {
    if (!review.reviewText) return "";
    if (!isLongReview || isExpanded) {
      return review.reviewText;
    }
    // Truncate at character limit and find the last space to avoid cutting words
    const truncated = review.reviewText.slice(0, CHARACTER_LIMIT);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    return lastSpaceIndex > 0 ? `${truncated.slice(0, lastSpaceIndex)}...` : `${truncated}...`;
  }, [review.reviewText, isLongReview, isExpanded]);

  return (
    <div className="bg-default-50 border border-default-200 rounded-lg p-6 h-full w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`size-4 ${
                i < Math.floor(review.rating)
                  ? "fill-warning-500 text-warning-500"
                  : "text-default-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-default-900 wrap-break-word">
          {review.userName || `User ${review.userId}`}
        </span>
      </div>
      {review.reviewText && (
        <div>
          <p className="text-default-700 leading-relaxed wrap-break-word whitespace-pre-wrap">
            {displayText}
          </p>
          {isLongReview && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 transition-colors"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
      <p className="text-xs text-default-500 mt-3">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}

export function CourseDetail({
  courseId,
  isPreview = false,
  onBack,
  courseData: apiCourseData,
  isWishlisted: isWishlistedProp = false,
  onEnroll,
  onWishlistToggle,
  enrolling = false,
  wishlistLoading = false,
  reviews: apiReviews = [],
  averageRating: apiAverageRating,
  totalReviews: apiTotalReviews,
  onWriteReview,
}: CourseDetailProps) {
  const router = useRouter();
  const { basicInfo, curriculum, pricing } = useCourseStore();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = React.useState(isWishlistedProp);
  const [showAllSections, setShowAllSections] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const [showPromoVideo, setShowPromoVideo] = React.useState(false);
  const [selectedLecture, setSelectedLecture] = React.useState<{
    lectureId: string;
    title: string;
    videoId?: number;
    videoUrl?: string;
  } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = React.useState<string>("25BBPMXNVD25");
  const [couponInput, setCouponInput] = React.useState<string>("");
  const [couponError, setCouponError] = React.useState<string>("");
  const [timeLeft, setTimeLeft] = React.useState<string>("");
  const { useGetAssetById } = useUpload();

  // Get instructor ID - from API data in normal mode, from current user in preview mode
  const instructorId = React.useMemo(() => {
    if (isPreview) {
      // In preview mode, use the current user's instructor ID
      return user?.instructorId;
    }
    // In normal mode, use the instructor ID from course data
    return apiCourseData?.instructor?.instructorId;
  }, [isPreview, user?.instructorId, apiCourseData?.instructor?.instructorId]);

  // Fetch instructor profile data (works in both preview and normal mode)
  const { data: instructorProfile, isLoading: instructorProfileLoading } =
    useQuery({
      queryKey: ["instructorProfile", instructorId],
      queryFn: () => {
        if (!instructorId) throw new Error("Instructor ID is required");
        return getInstructorProfile(instructorId);
      },
      enabled: !!instructorId && instructorId > 0,
      staleTime: Infinity, // Never refetch instructor info
      gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

  // Update wishlist state when prop changes
  React.useEffect(() => {
    setIsWishlisted(isWishlistedProp);
  }, [isWishlistedProp]);

  // Timer logic - 24 hour countdown with localStorage persistence
  React.useEffect(() => {
    const TIMER_KEY = `course_price_timer_${courseId || "preview"}`;
    const TIMER_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Initialize or get existing timer
    const initializeTimer = () => {
      const storedExpiry = localStorage.getItem(TIMER_KEY);
      const now = Date.now();

      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        
        // If timer has expired, create a new one
        if (now >= expiryTime) {
          const newExpiry = now + TIMER_DURATION;
          localStorage.setItem(TIMER_KEY, newExpiry.toString());
          return newExpiry;
        }
        
        return expiryTime;
      } else {
        // No timer exists, create a new one
        const newExpiry = now + TIMER_DURATION;
        localStorage.setItem(TIMER_KEY, newExpiry.toString());
        return newExpiry;
      }
    };

    // Format time remaining as readable string
    const formatTimeLeft = (milliseconds: number): string => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""} left at this price!`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""} left at this price!`;
      } else {
        return `${seconds} second${seconds !== 1 ? "s" : ""} left at this price!`;
      }
    };

    const expiryTime = initializeTimer();

    // Update timer every second
    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        // Timer expired, reinitialize
        const newExpiry = now + TIMER_DURATION;
        localStorage.setItem(TIMER_KEY, newExpiry.toString());
        setTimeLeft(formatTimeLeft(TIMER_DURATION));
        // Force re-run of effect
        window.location.reload();
      } else {
        setTimeLeft(formatTimeLeft(remaining));
      }
    };

    // Initial update
    updateTimer();

    // Set interval to update every second
    const intervalId = setInterval(updateTimer, 1000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [courseId]);

  // Get promo video URL directly from API response (no asset API call needed)
  const promoVideoDirectUrl = React.useMemo(() => {
    return apiCourseData?.promoVideoUrl || null;
  }, [apiCourseData?.promoVideoUrl]);

  // Check if promo video exists
  const hasPromoVideo = React.useMemo(() => {
    return Boolean(promoVideoDirectUrl || apiCourseData?.promoVideoId);
  }, [promoVideoDirectUrl, apiCourseData?.promoVideoId]);

  // Calculate total duration from curriculum
  const totalDuration = React.useMemo(() => {
    if (!curriculum?.sections) return 0;
    return curriculum.sections.reduce((total, section) => {
      return (
        total +
        section.lectures.reduce((sectionTotal, lecture) => {
          return sectionTotal + (lecture.duration || 15);
        }, 0)
      );
    }, 0);
  }, [curriculum]);

  // Fallback total duration from API sections (in minutes)
  const apiSectionsDuration = React.useMemo(() => {
    if (!apiCourseData?.sections) return 0;
    return apiCourseData.sections.reduce((total, section) => {
      return (
        total +
        section.lectures.reduce((sectionTotal, lecture) => {
          return sectionTotal + (lecture.duration || 0);
        }, 0)
      );
    }, 0);
  }, [apiCourseData?.sections]);

  // Transform store data to course data format
  const courseData: CourseData = React.useMemo(() => {
    // If we have API course data, transform it
    if (apiCourseData) {
      const parentCategoryName =
        (apiCourseData.category as unknown as { parentName?: string | null })?.parentName ||
        (apiCourseData.category as unknown as { parent?: { name?: string | null } })?.parent?.name ||
        null;
      
      return {
        id: apiCourseData.courseId,
        category: parentCategoryName || apiCourseData.category.name,
        parentCategory: parentCategoryName || undefined,
        subCategory: apiCourseData.category.name,
        title: apiCourseData.title,
        subHeading: undefined,
        duration: formatDuration(apiCourseData.stats.totalDuration),
        viewsCount: apiCourseData.stats.viewsCount || 0,
        rating: apiCourseData.stats.avgRating ?? undefined,
        ratingCount: apiCourseData.stats.totalReviews,
        enrollments: apiCourseData.stats.totalStudents,
        requirements: apiCourseData.requirements?.map((req) => req.description) || [],
        learningPoints: apiCourseData.learningPoints.map(
          (lp) => lp.description
        ),
        whoThisCourseIsFor: apiCourseData.targetAudience?.map((ta) => ({ description: ta.description })) || [],
        certificateDescription: apiCourseData.certificateDescription || undefined,
        description: apiCourseData.fullDescription,
        outline:
          apiCourseData.sections && apiCourseData.sections.length > 0
            ? apiCourseData.sections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((section) => ({
                  id: section.sectionId,
                  title: section.title,
                  lectures: section.lectures
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((lecture) => ({
                      id: lecture.lectureId,
                      title: lecture.title,
                      duration: lecture.duration,
                      isPreview: lecture.isPreview,
                      videoId: lecture.videoId,
                    })),
                }))
            : [],
        promoVideo: apiCourseData.promoVideoId,
        instructor: {
          id: apiCourseData.instructor.instructorId,
          name: apiCourseData.instructor.name,
          title: apiCourseData.instructor.professionalTitle || "Instructor",
          bio: apiCourseData.instructor.bio,
          avatar: apiCourseData.instructor.profilePictureUrl,
          rating: undefined,
          studentCount: undefined,
          courseCount: undefined,
        },
        reviews: [], // Reviews would come from a separate API
        updatedAt: apiCourseData.updatedAt,
      };
    }

    // If preview mode, use store data
    if (isPreview) {
      const categoryName = "Category";

      return {
        id: courseId,
        category: categoryName,
        subCategory: basicInfo?.learningLevel || "",
        title: basicInfo?.title || "Untitled Course",
        subHeading: categoryName,
        duration: formatDuration(totalDuration),
        viewsCount: 0,
        rating: 0,
        ratingCount: 0,
        enrollments: 0,
        requirements: basicInfo?.requirements || [],
        learningPoints:
          basicInfo?.learningPoints?.map((lp) => lp.description) || [],
        whoThisCourseIsFor: basicInfo?.whoThisCourseIsFor?.map((item) => ({ description: item })) || [],
        certificateDescription: basicInfo?.certificateDescription || undefined,
        description: basicInfo?.fullDescription || basicInfo?.description || "",
        outline:
          curriculum?.sections?.map((section, sectionIndex) => ({
            id: String(section.id),
            title:
              ("title" in section
                ? section.title
                : (section as { name: string }).name) ||
              section.title ||
              "",
            lectures: section.lectures.map((lecture, lectureIndex) => ({
              id: `${sectionIndex + 1}.${lectureIndex + 1}`,
              title:
                ("title" in lecture
                  ? lecture.title
                  : (lecture as { name: string }).name) ||
                lecture.title ||
                "",
              duration: lecture.duration ?? 0, // Show 0m when no video is added
            })),
          })) || [],
        promoVideo: basicInfo?.promoVideoId,
        instructor: {
          id: user?.instructorId,
          name: instructorProfile?.fullName || user?.name || "Instructor",
          title: instructorProfile?.professionalTitle || "Course Instructor",
          bio:
            instructorProfile?.bio ||
            "Instructor information will be displayed here.",
          avatar:
            instructorProfile?.profilePictureUrl ||
            user?.profilePictureUrl ||
            null,
          rating: instructorProfile?.stats?.avgRating,
          studentCount: instructorProfile?.stats?.totalStudents,
          courseCount: instructorProfile?.stats?.totalCourses,
        },
        reviews: [],
      };
    }

    // Otherwise use constants data
    return CONSTANTS.COURSE_DETAIL as CourseData;
  }, [
    apiCourseData,
    isPreview,
    courseId,
    basicInfo,
    curriculum,
    totalDuration,
    user?.instructorId,
    user?.name,
    user?.profilePictureUrl,
    instructorProfile,
  ]);

  // Calculate total number of lectures
  const totalLectures = React.useMemo(() => {
    if (courseData.outline && courseData.outline.length > 0) {
      return courseData.outline.reduce((total, section) => {
        return total + (section.lectures?.length || 0);
      }, 0);
    }
    return 0;
  }, [courseData.outline]);

  // Create a map of preview lecture IDs to their video URLs from the API
  const previewLectureVideoUrls = React.useMemo(() => {
    if (!apiCourseData?.previewLectures) return new Map<string, string>();
    const map = new Map<string, string>();
    apiCourseData.previewLectures.forEach((lecture) => {
      if (lecture.videoUrl) {
        map.set(lecture.lectureId, lecture.videoUrl);
      }
    });
    return map;
  }, [apiCourseData?.previewLectures]);

  // Calculate total number of resources
  const totalResources = React.useMemo(() => {
    // In preview mode, count from curriculum store
    if (isPreview && curriculum?.sections) {
      return curriculum.sections.reduce((total, section) => {
        return (
          total +
          section.lectures.reduce((sectionTotal, lecture) => {
            const resources = lecture.resources || [];
            return (
              sectionTotal + (Array.isArray(resources) ? resources.length : 0)
            );
          }, 0)
        );
      }, 0);
    }

    // In normal mode, check if API course data has resources
    // Note: CourseDetailLecture type doesn't include resources, but check if they exist in the actual response
    if (apiCourseData?.sections) {
      return apiCourseData.sections.reduce((total, section) => {
        return (
          total +
          section.lectures.reduce((sectionTotal, lecture) => {
            // Check if resources exist (even though not in type definition)
            const resources =
              (lecture as { resources?: unknown[] }).resources || [];
            return (
              sectionTotal + (Array.isArray(resources) ? resources.length : 0)
            );
          }, 0)
        );
      }, 0);
    }

    return 0;
  }, [isPreview, curriculum, apiCourseData]);

  // Get course banner URL for thumbnail (separate from promo video)
  // Only fetch asset in preview mode when we don't have URL from API
  const courseBannerId = isPreview ? basicInfo?.courseBannerId : null;
  const shouldFetchBannerAsset = isPreview && courseBannerId && !apiCourseData?.courseBannerUrl;
  const { data: bannerAsset } = useGetAssetById(
    shouldFetchBannerAsset ? courseBannerId : 0
  );
  const courseBannerUrl = React.useMemo(() => {
    // Priority: API URL > Preview mode asset
    if (apiCourseData?.courseBannerUrl) {
      return apiCourseData.courseBannerUrl;
    }
    if (isPreview && bannerAsset) {
      return bannerAsset.presigned_url || bannerAsset.file_url || "";
    }
    return "";
  }, [apiCourseData?.courseBannerUrl, isPreview, bannerAsset]);

  // Use course banner as thumbnail for the video player button
  const promoVideoSrc = React.useMemo(() => {
    // Priority: courseBannerUrl from API or store > placeholder
    if (courseBannerUrl) {
      return courseBannerUrl;
    }

    // Default placeholder
    return "https://placehold.co/1280x720/2977A9/FFFFFF/png?text=Course+Preview";
  }, [courseBannerUrl]);

  // Get instructor avatar URL directly from API (no asset API call needed)
  const instructorAvatarSrc = React.useMemo(() => {
    // Priority: instructorProfile > courseData.instructor.avatar > user.profilePictureUrl
    if (instructorProfile?.profilePictureUrl) {
      return instructorProfile.profilePictureUrl;
    }

    // Use the URL directly from API response or course data
    if (
      typeof courseData.instructor?.avatar === "string" &&
      courseData.instructor.avatar
    ) {
      return courseData.instructor.avatar;
    }

    // Return null to show initials fallback
    return null;
  }, [instructorProfile?.profilePictureUrl, courseData.instructor?.avatar]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top margin for fixed header */}
      <div className={isPreview ? "pt-6" : "pt-18"}>
        <div className=" mx-auto ">
          {/* Back button for preview mode */}
          {isPreview && onBack && (
            <div className="relative z-10 mb-6 max-w-container mx-auto px-4">
              <Button variant="outline" onClick={onBack} className="gap-2">
                ← Back
              </Button>
            </div>
          )}

          {/* Breadcrumb - Hide in preview mode */}
          {!isPreview && (
            <div className="relative z-10 my-4 max-w-container mx-auto">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <span className="text-default-900 font-semibold">
                      {courseData.category || "Category"}
                    </span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Link
                      href={`/topics?subcategory=${encodeURIComponent(
                        courseData.subCategory || courseData.category || "Category"
                      )}`}
                      className="text-default-600 hover:text-primary-600 transition-colors"
                    >
                      {courseData.subCategory || courseData.category || "Category"}
                    </Link>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Border below breadcrumb */}
          {!isPreview && <Separator className="relative z-10  mb-6" />}

          {/* Main Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-container mx-auto">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category and Title Section */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-default-900 leading-tight">
                  {courseData.title}
                </h1>
            {apiCourseData?.shortDescription &&
              apiCourseData.shortDescription.trim() !== "" && (
                  <p className="text-base md:text-lg text-default-700 leading-relaxed">
                {truncateShortDescription(apiCourseData.shortDescription)}
                  </p>
                )}
                <div className="space-y-2">
                  {/* Rating Line */}
                  {courseData.rating !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-warning-500 font-bold text-base">
                        {typeof courseData.rating === "number" ? courseData.rating.toFixed(1) : courseData.rating}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`size-4 ${
                              i < Math.floor(courseData.rating || 0)
                                ? "fill-warning-500 text-warning-500"
                                : "text-default-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-default-600">
                        ({courseData.ratingCount || 0} {courseData.ratingCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}

                  {/* Last Updated Line */}
                  {!isPreview && courseData.updatedAt && (
                    <div className="text-sm text-default-600">
                      <span>Last updated </span>
                      <span>
                        {new Date(courseData.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {/* Students and Lectures Line */}
                  <div className="flex items-center gap-3 text-sm text-default-600">
                    <span>
                      {courseData.enrollments
                        ? `${courseData.enrollments.toLocaleString()} students`
                        : "0 students"}
                    </span>
                    {totalLectures > 0 && (
                      <>
                        <span className="text-default-400">•</span>
                        <span>
                          {totalLectures} lecture{totalLectures !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Requirements */}
              {courseData.requirements && courseData.requirements.length > 0 && (
                <div className="bg-default-100 rounded-md p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-default-900">
                    Requirements
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="size-5 text-primary-600 shrink-0 mt-0.5" />
                        <p className="text-default-700">{requirement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Points */}
              {courseData.learningPoints.length > 0 && (
                <div className="bg-default-100 rounded-md p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-default-900">
                    What you will learn
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseData.learningPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckIcon className="size-5 text-success-600 shrink-0 mt-0.5" />
                        <p className="text-default-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* This course includes */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-default-900">
                  This course includes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!isPreview && apiCourseData?.stats && (
                    <>
                      <div className="flex items-center gap-3 text-default-700">
                        <VideoIcon className="size-5 text-default-600 shrink-0" />
                        <span>
                          {formatHoursLabel(
                            (apiCourseData.stats.totalDuration || 0) || apiSectionsDuration
                          )}
                        </span>
                      </div>
                      {apiCourseData.stats.totalResources > 0 && (
                        <div className="flex items-center gap-3 text-default-700">
                          <DownloadIcon className="size-5 text-default-600 shrink-0" />
                          <span>
                            {apiCourseData.stats.totalResources} downloadable resource
                            {apiCourseData.stats.totalResources !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {isPreview && (
                    <>
                      <div className="flex items-center gap-3 text-default-700">
                        <VideoIcon className="size-5 text-default-600 shrink-0" />
                        <span>
                          {formatHoursLabel(totalDuration || 0)}
                        </span>
                      </div>
                      {totalResources > 0 && (
                        <div className="flex items-center gap-3 text-default-700">
                          <DownloadIcon className="size-5 text-default-600 shrink-0" />
                          <span>
                            {totalResources} downloadable resource
                            {totalResources !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-3 text-default-700">
                    <InfinityIcon className="size-5 text-default-600 shrink-0" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3 text-default-700">
                    <AwardIcon className="size-5 text-default-600 shrink-0" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>

              {/* Last Updated */}

              {/* Course Outline */}
              {courseData.outline && courseData.outline.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Course Curriculum
                  </h2>
                  <Accordion
                    type="multiple"
                    defaultValue={[courseData.outline[0]?.id]}
                    className="w-full bg-white"
                  >
                    {(showAllSections
                      ? courseData.outline
                      : courseData.outline.slice(0, 4)
                    ).map((section, sectionIndex) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="text-left hover:no-underline ">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-default-900 font-medium">
                              Module {sectionIndex + 1}: {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {section.lectures.map((lecture) => {
                              const isPreview = lecture.isPreview ?? false;
                              const handleLectureClick = () => {
                                if (isPreview && lecture.videoId) {
                                  // Check if we have the video URL from previewLectures array
                                  const videoUrl = previewLectureVideoUrls.get(lecture.id);
                                  setSelectedLecture({
                                    lectureId: lecture.id,
                                    title: lecture.title,
                                    videoId: lecture.videoId,
                                    videoUrl: videoUrl || undefined,
                                  });
                                }
                              };

                              return isPreview ? (
                                <button
                                  key={lecture.id}
                                  type="button"
                                  onClick={handleLectureClick}
                                  className="flex items-center justify-between py-2 px-3 rounded-md transition-colors hover:bg-default-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full text-left"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {isPreview ? (
                                      <PlayIcon className="size-5 text-primary-600 shrink-0" />
                                    ) : (
                                      <LockIcon className="size-5 text-black shrink-0" />
                                    )}

                                    <span
                                      className={`${
                                        isPreview
                                          ? "text-default-700"
                                          : "text-black"
                                      }`}
                                    >
                                      {lecture.title}
                                    </span>
                                  </div>
                                  <span className="text-sm text-default-600">
                                    {formatLectureDuration(lecture.duration)}
                                  </span>
                                </button>
                              ) : (
                                <div
                                  key={lecture.id}
                                  className="flex items-center justify-between py-2 px-3 rounded-md transition-colors cursor-not-allowed opacity-60"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <LockIcon className="size-5 text-black shrink-0" />
                                    <span className="text-black">
                                      {lecture.title}
                                    </span>
                                  </div>
                                  <span className="text-sm text-default-600">
                                    {formatLectureDuration(lecture.duration)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {courseData.outline.length > 4 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAllSections(!showAllSections)}
                      className="w-full gap-2"
                    >
                      {showAllSections
                        ? "Show Less"
                        : `Show ${courseData.outline.length - 4} More Sections`}
                      <ChevronDownIcon
                        className={`size-4 transition-transform ${
                          showAllSections ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  )}
                </div>
              )}

              {/* Course Description */}
              {courseData.description && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Course Description
                  </h2>
                  <div
                    className={`course-description transition-all duration-300 ${
                      !showFullDescription
                        ? "max-h-96 overflow-hidden relative"
                        : ""
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: courseData.description,
                      }}
                    />
                    {!showFullDescription &&
                      courseData.description.length > 500 && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
                      )}
                  </div>
                  {courseData.description.length > 500 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="w-full gap-2"
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                      <ChevronDownIcon
                        className={`size-4 transition-transform ${
                          showFullDescription ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  )}
                </div>
              )}

              {/* Who This Course Is For */}
              {courseData.whoThisCourseIsFor && courseData.whoThisCourseIsFor.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Who This Course Is For
                  </h2>
                  <ul className="space-y-3">
                    {courseData.whoThisCourseIsFor.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary-600 mt-1">•</span>
                        <p className="text-default-700 leading-relaxed">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificate of Completion */}
              {courseData.certificateDescription && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Certificate of Completion
                  </h2>
                  <p className="text-default-700 leading-relaxed">
                    {courseData.certificateDescription}
                  </p>
                </div>
              )}

              {/* Student Reviews */}
              {!isPreview && apiReviews.length > 0 && (
                <div className="space-y-6 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-default-900">
                        Student Reviews
                      </h2>
                      {apiAverageRating !== undefined &&
                        apiTotalReviews !== undefined && (
                          <div className="flex items-center gap-2 mt-2 text-default-600">
                            <div className="flex items-center gap-1">
                              <StarIcon className="size-5 fill-warning-500 text-warning-500" />
                              <span className="font-semibold text-lg">
                                {apiAverageRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm">
                              ({apiTotalReviews}{" "}
                              {apiTotalReviews === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        )}
                    </div>
                    {apiCourseData?.isEnrolled && onWriteReview && (
                      <Button
                        onClick={onWriteReview}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <StarIcon className="size-4" />
                        Write a Review
                      </Button>
                    )}
                  </div>
                  <Slider
                    slidesPerView={1}
                    spaceBetween={16}
                    navigation={{
                      enabled: apiReviews.length > 2,
                      position: "center",
                      showArrows: apiReviews.length > 2,
                      spacing: "",
                    }}
                    breakpoints={{
                      640: { slidesPerView: 2, spaceBetween: 16 },
                    }}
                    slideClassName="py-4"
                    pagination={{
                      enabled: false,
                    }}
                  >
                    {apiReviews.map((review) => (
                      <ReviewCard key={review.reviewId} review={review} />
                    ))}
                  </Slider>
                </div>
              )}

              {/* No reviews - Show write review button if enrolled */}
              {!isPreview &&
                apiReviews.length === 0 &&
                apiCourseData?.isEnrolled &&
                onWriteReview && (
                  <div className="space-y-4 pb-8">
                    <h2 className="text-2xl font-semibold text-default-900">
                      Student Reviews
                    </h2>
                    <div className="bg-default-50 border border-default-200 rounded-lg p-8 text-center">
                      <p className="text-default-600 mb-4">
                        No reviews yet. Be the first to share your experience!
                      </p>
                      <Button
                        onClick={onWriteReview}
                        variant="outline"
                        className="flex items-center gap-2 mx-auto"
                      >
                        <StarIcon className="size-4" />
                        Write a Review
                      </Button>
                    </div>
                  </div>
                )}

              {/* Instructor Information */}
              {courseData.instructor && (
                <div className="space-y-6 pb-8">
                  <h2 className="text-2xl font-semibold text-default-900">
                    About the Instructor
                  </h2>
                  {instructorProfileLoading ? (
                    <InstructorSkeleton />
                  ) : (
                    <div className="space-y-6">
                      {/* Instructor Header */}
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="size-24 border-2 border-default-300 shrink-0">
                          {instructorProfile?.profilePictureUrl ? (
                            <AvatarImage
                              src={instructorProfile.profilePictureUrl}
                              alt={
                                instructorProfile.fullName ||
                                courseData.instructor.name
                              }
                            />
                          ) : instructorAvatarSrc ? (
                            <AvatarImage
                              src={instructorAvatarSrc}
                              alt={courseData.instructor.name}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-semibold">
                            {instructorProfile
                              ? `${instructorProfile.firstName.charAt(0)}${instructorProfile.lastName.charAt(0)}`.toUpperCase()
                              : courseData.instructor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-default-900">
                                {instructorProfile?.fullName ||
                                  courseData.instructor.name}
                              </h3>
                              <p className="text-default-600 mt-1">
                                {instructorProfile?.professionalTitle ||
                                  courseData.instructor.title}
                              </p>
                            </div>
                            {courseData.instructor.id && (
                              <Link
                                href={`/profile/instructor/${courseData.instructor.id}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  View Profile
                                  <ArrowRightIcon className="size-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                          
                          {/* Stats Cards */}
                          {instructorProfile?.stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {/* Average Rating */}
                              {instructorProfile.stats.avgRating > 0 && (
                                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <StarIcon className="size-4 text-warning-600 fill-warning-600" />
                                    <span className="text-lg font-bold text-warning-900">
                                      {instructorProfile.stats.avgRating.toFixed(1)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-warning-700 font-medium">
                                    Instructor Rating
                                  </p>
                                </div>
                              )}
                              
                              {/* Total Students */}
                              {instructorProfile.stats.totalStudents > 0 && (
                                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <UsersIcon className="size-4 text-primary-600" />
                                    <span className="text-lg font-bold text-primary-900">
                                      {instructorProfile.stats.totalStudents.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-primary-700 font-medium">
                                    Students
                                  </p>
                                </div>
                              )}
                              
                              {/* Total Reviews */}
                              {instructorProfile.stats.totalReviews > 0 && (
                                <div className="bg-success-50 border border-success-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <MessageSquareIcon className="size-4 text-success-600" />
                                    <span className="text-lg font-bold text-success-900">
                                      {instructorProfile.stats.totalReviews.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-success-700 font-medium">
                                    Reviews
                                  </p>
                                </div>
                              )}
                              
                              {/* Total Courses */}
                              {instructorProfile.stats.totalCourses > 0 && (
                                <div className="bg-default-100 border border-default-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <GraduationCapIcon className="size-4 text-default-700" />
                                    <span className="text-lg font-bold text-default-900">
                                      {instructorProfile.stats.totalCourses}
                                    </span>
                                  </div>
                                  <p className="text-xs text-default-700 font-medium">
                                    Courses
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Bio - Truncated with "Show more" link */}
                          <div className="pt-2">
                            <p className="text-default-700 leading-relaxed line-clamp-5">
                              {instructorProfile?.bio || courseData.instructor.bio}
                            </p>
                            {courseData.instructor.id && (
                              <Link
                                href={`/profile/instructor/${courseData.instructor.id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block transition-colors"
                              >
                                Show more →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sticky Enrollment Card */}
            <div className="lg:col-span-1 ">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-default-200 rounded-lg shadow-lg overflow-hidden">
                  {/* Course Banner Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden bg-default-100">
                    {promoVideoSrc ? (
                      <Image
                        src={promoVideoSrc}
                        alt="Course banner"
                        fill
                        className="object-cover"
                        priority
                        unoptimized={promoVideoSrc.includes("amazonaws.com")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-default-200">
                        <span className="text-default-500 text-sm">
                          Course Banner
                        </span>
                      </div>
                    )}

                    {/* Play Button Overlay - Only show if promo video exists */}
                    {hasPromoVideo && (
                      <button
                        type="button"
                        onClick={() => setShowPromoVideo(true)}
                        className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center group cursor-pointer"
                        aria-label="Play course preview video"
                      >
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
                          <PlayIcon className="size-8 text-primary-600 fill-primary-600" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    {/* Pricing Section - Only show if NOT enrolled */}
                    {!isPreview && apiCourseData?.pricing && !apiCourseData?.isEnrolled && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            {(() => {
                              const price = apiCourseData.pricing.amount;
                              const originalPrice = apiCourseData.pricing.originalAmount;
                              // If coupon is applied, show original price with strikethrough and $0 free
                              const hasCouponApplied = appliedCoupon && appliedCoupon === "25BBPMXNVD25";
                              // If coupon is applied, make it free (100% discount)
                              const isFree = price === 0 || (hasCouponApplied && price > 0);
                              const displayPrice = isFree && hasCouponApplied ? 0 : price;
                              // Show original price if: there's an original price > display price, OR if coupon applied (show current price as strikethrough)
                              const showOriginal =
                                (originalPrice && originalPrice > displayPrice) ||
                                (hasCouponApplied && price > 0);
                              const originalPriceToShow = originalPrice || price;
                              const discountPercentage = hasCouponApplied && price > 0 && displayPrice === 0
                                ? 100
                                : apiCourseData.pricing.discountPercentage;

                              return (
                                <>
                                  <span className="text-3xl font-bold text-default-900">
                                    {displayPrice === 0 ? "Free" : `$${displayPrice.toFixed(2)}`}
                                  </span>
                                  {showOriginal && (
                                    <span className="text-lg text-default-400 line-through">
                                      ${originalPriceToShow.toFixed(2)}
                                    </span>
                                  )}
                                  {discountPercentage > 0 && (
                                    <span className="text-sm font-semibold text-primary-600">
                                      {Math.round(discountPercentage)}% off
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: courseData.title,
                                  url: window.location.href,
                                });
                              } else {
                                navigator.clipboard.writeText(window.location.href);
                                // You could add a toast notification here
                              }
                            }}
                          >
                            <Share2Icon className="size-4" />
                          </Button>
                        </div>
                        {/* Time Left Alert */}
                        {timeLeft && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <ClockIcon className="size-4" />
                            <span>{timeLeft}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isPreview && pricing && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            {(() => {
                              const { price, originalPrice, isFree: pricingIsFree, currency, discountPercentage } = pricing;
                              // If coupon is applied, show original price with strikethrough and $0 free
                              const hasCouponApplied = appliedCoupon && appliedCoupon === "25BBPMXNVD25";
                              // If coupon is applied, make it free (100% discount)
                              const isFree = pricingIsFree || (hasCouponApplied && price > 0);
                              const displayPrice = isFree && hasCouponApplied ? 0 : (price ?? 0);
                              const displayCurrency = currency || "$";
                              // Show original price if: there's an original price > display price, OR if coupon applied (show current price as strikethrough)
                              const showOriginal =
                                (originalPrice && originalPrice > displayPrice) ||
                                (hasCouponApplied && price > 0);
                              const originalPriceToShow = originalPrice || price || 0;
                              const finalDiscountPercentage = hasCouponApplied && price > 0 && displayPrice === 0
                                ? 100
                                : discountPercentage || 0;

                              return (
                                <>
                                  <span className="text-3xl font-bold text-default-900">
                                    {displayPrice === 0 ? "Free" : `${displayCurrency} ${displayPrice.toFixed(2)}`}
                                  </span>
                                  {showOriginal && (
                                    <span className="text-lg text-default-400 line-through">
                                      {displayCurrency} {originalPriceToShow.toFixed(2)}
                                    </span>
                                  )}
                                  {finalDiscountPercentage > 0 && (
                                    <span className="text-sm font-semibold text-primary-600">
                                      {Math.round(finalDiscountPercentage)}% off
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: courseData.title,
                                  url: window.location.href,
                                });
                              } else {
                                navigator.clipboard.writeText(window.location.href);
                                // You could add a toast notification here
                              }
                            }}
                          >
                            <Share2Icon className="size-4" />
                          </Button>
                        </div>
                        {timeLeft && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <ClockIcon className="size-4" />
                            <span>{timeLeft}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!isPreview && (
                        <>
                          <div className="flex items-center gap-2">
                            {apiCourseData?.isEnrolled ? (
                              <Button
                                className={`${
                                  user?.role !== "instructor" ? "flex-1" : "w-full"
                                } bg-primary-400 hover:bg-primary-500 text-white`}
                                size="lg"
                                onClick={() => {
                                  if (apiCourseData?.courseId && apiCourseData?.sections?.length > 0) {
                                    const firstLecture = apiCourseData.sections[0]?.lectures[0];
                                    if (firstLecture) {
                                      const url = createLectureUrl(
                                        apiCourseData.title,
                                        apiCourseData.courseId,
                                        firstLecture.title,
                                        firstLecture.lectureId
                                      );
                                      router.push(url);
                                    }
                                  }
                                }}
                              >
                                Go to Lectures
                                <ArrowRightIcon className="size-4 ml-2" />
                              </Button>
                            ) : (
                              <Button
                                className={`${
                                  user?.role !== "instructor" ? "flex-1" : "w-full"
                                } bg-primary-400 hover:bg-primary-500 text-white`}
                                size="lg"
                                onClick={onEnroll}
                                disabled={enrolling}
                              >
                                {enrolling ? "Enrolling..." : "Enroll Now"}
                              </Button>
                            )}
                            {user?.role !== "instructor" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 h-11 w-11"
                                onClick={onWishlistToggle}
                                disabled={wishlistLoading}
                              >
                                <HeartIcon
                                  className={`size-4 ${
                                    isWishlisted
                                      ? "fill-destructive text-destructive"
                                      : ""
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                      {isPreview && pricing && (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-default-900">
                              {pricing.isFree
                                ? "Free"
                                : `${pricing.currency || "$"} ${(pricing.price ?? 0).toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Money-Back Guarantee */}
                    <p className="text-sm text-center text-default-600">
                      30-Day Money-Back Guarantee
                    </p>

                    <Separator />

                    {/* Coupon Section */}
                    <div className="space-y-3">
                      {appliedCoupon && appliedCoupon === "25BBPMXNVD25" && (
                        <div className="bg-success-50 border border-success-200 rounded-md p-3">
                          <p className="text-sm font-medium text-success-700">
                            {appliedCoupon} is applied
                          </p>
                          <p className="text-xs text-success-600 mt-1">
                            Eduta coupon
                          </p>
                        </div>
                      )}

                      {/* Coupon Error Message */}
                      {couponError && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                          <p className="text-sm text-destructive">
                            {couponError}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter Coupon"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError(""); // Clear error when user types
                          }}
                          className="flex-1 h-12"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (couponInput.trim()) {
                              // Only allow the static coupon
                              if (couponInput.trim() === "25BBPMXNVD25") {
                                setAppliedCoupon(couponInput.trim());
                                setCouponInput("");
                                setCouponError("");
                              } else {
                                // Show error message for invalid coupon
                                setCouponError(
                                  "The coupon code entered is not valid for this course. already one coupon is applied"
                                );
                                setCouponInput("");
                              }
                            }
                          }}
                          className="bg-primary-400 hover:bg-primary-500 text-white h-12"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ - Hide in preview mode */}
          {!isPreview && <FAQComponent faqs={apiCourseData?.faqs} />}
        </div>
      </div>

      {/* Promo Video Dialog */}
      <VideoPreviewModal
        open={showPromoVideo}
        onOpenChange={setShowPromoVideo}
        videoUrl={promoVideoDirectUrl}
        isLoading={false}
        title={courseData.title}
        subtitle="Course Preview"
        dialogTitle={`Course Preview: ${courseData.title}`}
        className="w-[95vw] md:w-[50.5rem]"
        bottomInfo={
          <div className="flex items-center gap-4">
            {courseData.duration && (
              <span className="flex items-center gap-2">
                <VideoIcon className="size-4" />
                {courseData.duration}
              </span>
            )}
            {courseData.rating !== undefined && (
              <span className="flex items-center gap-2">
                <StarIcon className="size-4 fill-warning-400 text-warning-400" />
                {courseData.rating} ({courseData.ratingCount || 0})
              </span>
            )}
          </div>
        }
      />

      {/* Lecture Preview Video Dialog */}
      {selectedLecture && (
        <LecturePreviewDialog
          lecture={selectedLecture}
          courseTitle={courseData.title}
          onClose={() => setSelectedLecture(null)}
          useGetAssetById={useGetAssetById}
        />
      )}
    </div>
  );
}

// Lecture Preview Dialog Wrapper
interface LecturePreviewDialogProps {
  lecture: {
    lectureId: string;
    title: string;
    videoId?: number;
    videoUrl?: string;
  };
  courseTitle: string;
  onClose: () => void;
  useGetAssetById: (assetId: number) => {
    data: { presigned_url?: string; file_url?: string } | undefined;
    isLoading: boolean;
  };
}

function LecturePreviewDialog({
  lecture,
  courseTitle,
  onClose,
  useGetAssetById,
}: LecturePreviewDialogProps) {
  // Only fetch asset if we don't have the video URL already
  const shouldFetchAsset = !lecture.videoUrl && lecture.videoId;
  const { data: videoAsset, isLoading: videoAssetLoading } = useGetAssetById(
    shouldFetchAsset ? (lecture.videoId ?? 0) : 0
  );

  const videoUrl = React.useMemo(() => {
    // Priority: Use provided videoUrl > fetch from asset API
    if (lecture.videoUrl) return lecture.videoUrl;
    if (!videoAsset) return null;
    return videoAsset.presigned_url || videoAsset.file_url || null;
  }, [lecture.videoUrl, videoAsset]);

  const isLoading = shouldFetchAsset ? videoAssetLoading : false;

  return (
    <VideoPreviewModal
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      videoUrl={videoUrl}
      isLoading={isLoading}
      title={lecture.title}
      subtitle={courseTitle}
      dialogTitle={`Lecture Preview: ${lecture.title} - ${courseTitle}`}
      className="w-[95vw] md:w-[50.5rem]"
      bottomInfo={<span className="text-white/50 text-xs">Lecture Preview</span>}
    />
  );
}

// Course Metadata Skeleton Component
export function CourseMetadataSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="h-10 w-3/4" />
      
      {/* Short Description */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
      
      {/* Metadata - New vertical layout */}
      <div className="space-y-2">
        {/* Rating Line */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Last Updated Line */}
        <Skeleton className="h-4 w-40" />
        
        {/* Students and Lectures Line */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

// Instructor Skeleton Component
function InstructorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="size-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          
          {/* Bio Skeleton */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
