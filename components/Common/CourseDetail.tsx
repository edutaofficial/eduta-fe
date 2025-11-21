"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
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
  UserIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  LockIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCourseStore } from "@/store/useCourseStore";
import FAQComponent from "../Home/FAQ";
import { useAuth } from "@/lib/context/AuthContext";
import { VideoPlayer } from "../Learn/VideoPlayer";
import { useUpload } from "@/hooks/useUpload";

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
  subCategory?: string;
  title: string;
  subHeading?: string;
  duration?: string;
  viewsCount?: number;
  rating?: number;
  ratingCount?: number;
  enrollments?: number;
  learningPoints: string[];
  description: string;
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
    videoId: number;
  } | null>(null);
  const { useGetAssetById } = useUpload();

  // Update wishlist state when prop changes
  React.useEffect(() => {
    setIsWishlisted(isWishlistedProp);
  }, [isWishlistedProp]);

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

  // Transform store data to course data format
  const courseData: CourseData = React.useMemo(() => {
    // If we have API course data, transform it
    if (apiCourseData) {
      return {
        id: apiCourseData.courseId,
        category: apiCourseData.category.name,
        subCategory: apiCourseData.learningLevel,
        title: apiCourseData.title,
        subHeading: apiCourseData.category.name,
        duration: formatDuration(apiCourseData.stats.totalDuration),
        viewsCount: apiCourseData.stats.viewsCount || 0,
        rating: apiCourseData.stats.avgRating ?? undefined,
        ratingCount: apiCourseData.stats.totalReviews,
        enrollments: apiCourseData.stats.totalStudents,
        learningPoints: apiCourseData.learningPoints.map(
          (lp) => lp.description
        ),
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
                      duration: lecture.durationFormatted,
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
        learningPoints:
          basicInfo?.learningPoints?.map((lp) => lp.description) || [],
        description: basicInfo?.description || "",
        outline:
          curriculum?.sections?.map((section, sectionIndex) => ({
            id: String(section.id),
            title: section.title,
            lectures: section.lectures.map((lecture, lectureIndex) => ({
              id: `${sectionIndex + 1}.${lectureIndex + 1}`,
              title: lecture.title,
              duration: lecture.duration || 15,
            })),
          })) || [],
        promoVideo: basicInfo?.promoVideoId,
        instructor: {
          name: "Instructor",
          title: "Course Instructor",
          bio: "Instructor information will be displayed here.",
          avatar: null,
          rating: 0,
          studentCount: 0,
          courseCount: 0,
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
  ]);

  // Get course banner URL for thumbnail (separate from promo video)
  const courseBannerUrl = apiCourseData?.courseBannerUrl || "";

  // Use course banner as thumbnail for the video player button
  const promoVideoSrc = React.useMemo(() => {
    // Priority: courseBannerUrl from API > placeholder
    if (courseBannerUrl) {
      return courseBannerUrl;
    }

    // Default placeholder
    return "https://placehold.co/1280x720/2977A9/FFFFFF/png?text=Course+Preview";
  }, [courseBannerUrl]);

  // Get instructor avatar URL directly from API (no asset API call needed)
  const instructorAvatarSrc = React.useMemo(() => {
    // Use the URL directly from API response
    if (
      typeof courseData.instructor?.avatar === "string" &&
      courseData.instructor.avatar
    ) {
      return courseData.instructor.avatar;
    }

    // Return null to show initials fallback
    return null;
  }, [courseData.instructor?.avatar]);

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
                    <BreadcrumbLink
                      href="/"
                      className="text-primary-400 hover:text-primary-500"
                    >
                      Eduta
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href={`/category/${courseData.category?.toLowerCase().replace(/\s+/g, "-") || "category"}`}
                      className="text-default-900 hover:text-primary-400"
                    >
                      {courseData.category || "Category"}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-default-900">
                      {courseData.subCategory || "Course"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Border below breadcrumb */}
          {!isPreview && <Separator className="relative z-10  mb-6" />}

          {/* Course Detail Banner - Hide in preview mode */}
          {!isPreview && (
            <div className="absolute top-[126px] left-0 w-full h-171.25 aspect-video bg-default-100 group cursor-pointer z-0">
              <Image
                src="/detail-banner.webp"
                alt="Course Detail Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Logo - Hide in preview mode */}
          {!isPreview && (
            <div className="relative z-10 mb-6 max-w-container mx-auto">
              <Image
                src="/logo-main.webp"
                alt="Eduta Logo"
                width={220}
                height={70}
                className="w-55 h-auto"
                priority
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-container mx-auto">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Category and Title Section */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {courseData.subHeading || courseData.category || ""}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-default-900 leading-tight">
                  {courseData.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-default-700">
                  <span>{courseData.duration || "0 hours"}</span>
                  {courseData.viewsCount !== undefined && (
                    <>
                      <span className="text-default-400">•</span>
                      <span>
                        {courseData.viewsCount.toLocaleString()} view
                        {courseData.viewsCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                  {courseData.rating !== undefined && (
                    <>
                      <span className="text-default-400">•</span>
                      <div className="flex items-center gap-1">
                        <span className="text-warning-500 font-semibold">
                          {courseData.rating}
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
                        <span className="ml-1">
                          ({courseData.ratingCount || 0})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

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

              {/* Course Outline */}
              {courseData.outline && courseData.outline.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Course Outline
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
                              Section {sectionIndex + 1}: {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {section.lectures.map((lecture) => {
                              const isPreview = lecture.isPreview ?? false;
                              const handleLectureClick = () => {
                                if (isPreview && lecture.videoId) {
                                  setSelectedLecture({
                                    lectureId: lecture.id,
                                    title: lecture.title,
                                    videoId: lecture.videoId,
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
                    className={`prose prose-lg max-w-none text-default-700 transition-all duration-300 ${
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
                      <div
                        key={review.reviewId}
                        className="bg-default-50 border border-default-200 rounded-lg p-6 h-full"
                      >
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
                          <p className="text-default-700 leading-relaxed wrap-break-word">
                            {review.reviewText}
                          </p>
                        )}
                        <p className="text-xs text-default-500 mt-3">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
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
                <div className="space-y-4 pb-8">
                  <h2 className="text-2xl font-semibold text-default-900">
                    About the Instructor
                  </h2>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="size-20 border-2 border-default-300">
                      {instructorAvatarSrc ? (
                        <AvatarImage
                          src={instructorAvatarSrc}
                          alt={courseData.instructor.name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-semibold">
                        {courseData.instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-default-900">
                            {courseData.instructor.name}
                          </h3>
                          <p className="text-default-600">
                            {courseData.instructor.title}
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
                      {courseData.instructor.rating !== undefined && (
                        <div className="flex items-center gap-4 text-sm text-default-600">
                          <div className="flex items-center gap-1">
                            <StarIcon className="size-4 text-warning-500" />
                            <span>{courseData.instructor.rating}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {courseData.instructor.studentCount?.toLocaleString() ||
                              0}{" "}
                            students
                          </span>
                          <span>•</span>
                          <span>
                            {courseData.instructor.courseCount || 0} courses
                          </span>
                        </div>
                      )}
                      <p className="text-default-700 leading-relaxed">
                        {courseData.instructor.bio}
                      </p>
                    </div>
                  </div>
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
                    <h3 className="text-xl font-semibold text-default-900 line-clamp-2">
                      {courseData.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-default-700">
                      <span>{courseData.duration || "0 hours"}</span>
                      {courseData.viewsCount !== undefined && (
                        <>
                          <span className="text-default-400">•</span>
                          <span>
                            {courseData.viewsCount.toLocaleString()} view
                            {courseData.viewsCount !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Enrollments */}
                    {courseData.enrollments !== undefined && (
                      <div className="flex items-center gap-2 text-default-700">
                        <UserIcon className="size-5 text-default-600" />
                        <span className="font-medium">
                          {courseData.enrollments.toLocaleString()} enrolled
                        </span>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!isPreview && (
                        <>
                          {apiCourseData?.isEnrolled ? (
                            <Button
                              className="w-full bg-primary-400 hover:bg-primary-500 text-white"
                              size="lg"
                              onClick={() => {
                                if (apiCourseData?.courseId) {
                                  router.push(
                                    `/learn/${apiCourseData.courseId}/lectures`
                                  );
                                }
                              }}
                            >
                              Go to Lectures
                              <ArrowRightIcon className="size-4 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-primary-400 hover:bg-primary-500 text-white"
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
                              className="w-full"
                              onClick={onWishlistToggle}
                              disabled={wishlistLoading}
                            >
                              <HeartIcon
                                className={`size-5 mr-2 ${
                                  isWishlisted
                                    ? "fill-destructive text-destructive"
                                    : ""
                                }`}
                              />
                              {isWishlisted
                                ? "Remove from Wishlist"
                                : "Add to Wishlist"}
                            </Button>
                          )}
                        </>
                      )}
                      {isPreview && pricing && (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-default-900">
                              {pricing.isFree
                                ? "Free"
                                : `${pricing.currency} ${pricing.price.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ - Hide in preview mode */}
          {!isPreview && <FAQComponent />}
        </div>
      </div>

      {/* Promo Video Dialog */}
      <Dialog open={showPromoVideo} onOpenChange={setShowPromoVideo}>
        <DialogContent className="max-w-7xl w-[95vw] p-0 gap-0 bg-black border-none">
          <DialogTitle className="sr-only">
            Course Preview: {courseData.title}
          </DialogTitle>
          {/* Close Button - Always visible */}
          <button
            onClick={() => setShowPromoVideo(false)}
            className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2.5 transition-all group"
            aria-label="Close video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6 text-white group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header with course info */}
          <div className="bg-gradient-to-b from-black/90 to-transparent px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 rounded-full p-2">
                <PlayIcon className="size-4 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold line-clamp-1">
                  {courseData.title}
                </h3>
                <p className="text-white/70 text-xs">Course Preview</p>
              </div>
            </div>
          </div>

          {/* Video Container - No overlays blocking controls */}
          <div className="relative w-full aspect-video bg-black">
            {promoVideoDirectUrl ? (
              <div className="w-full h-full">
                <VideoPlayer
                  videoUrl={promoVideoDirectUrl}
                  startPosition={0}
                  onProgressUpdate={() => {}}
                  onVideoEnd={() => {}}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                <VideoIcon className="size-16 text-white/40" />
                <p className="text-lg font-medium">Loading video preview...</p>
                <p className="text-sm text-white/60">Please wait a moment</p>
              </div>
            )}
          </div>

          {/* Bottom info bar - Doesn't overlay video controls */}
          <div className="bg-gradient-to-t from-black/90 to-transparent px-6 py-3">
            <div className="flex items-center justify-between text-white/80 text-sm">
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
              <span className="text-white/50 text-xs">Press ESC to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

// Separate component for lecture preview dialog
interface LecturePreviewDialogProps {
  lecture: {
    lectureId: string;
    title: string;
    videoId: number;
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
  const { data: videoAsset, isLoading: videoAssetLoading } = useGetAssetById(
    lecture.videoId
  );

  const videoUrl = React.useMemo(() => {
    if (!videoAsset) return null;
    return videoAsset.presigned_url || videoAsset.file_url || null;
  }, [videoAsset]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] p-0 gap-0 bg-black border-none">
        <DialogTitle className="sr-only">
          Lecture Preview: {lecture.title} - {courseTitle}
        </DialogTitle>
        {/* Close Button - Always visible */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2.5 transition-all group"
          aria-label="Close video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header with course info */}
        <div className="bg-gradient-to-b from-black/90 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 rounded-full p-2">
              <PlayIcon className="size-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold line-clamp-1">
                {lecture.title}
              </h3>
              <p className="text-white/70 text-xs">{courseTitle}</p>
            </div>
          </div>
        </div>

        {/* Video Container - No overlays blocking controls */}
        <div className="relative w-full aspect-video bg-black">
          {videoAssetLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent" />
              <p className="text-lg font-medium">Loading video preview...</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full">
              <VideoPlayer
                videoUrl={videoUrl}
                startPosition={0}
                onProgressUpdate={() => {}}
                onVideoEnd={() => {}}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <VideoIcon className="size-16 text-white/40" />
              <p className="text-lg font-medium">Video not available</p>
              <p className="text-sm text-white/60">
                This preview video could not be loaded
              </p>
            </div>
          )}
        </div>

        {/* Bottom info bar - Doesn't overlay video controls */}
        <div className="bg-gradient-to-t from-black/90 to-transparent px-6 py-3">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-white/50 text-xs">Lecture Preview</span>
            </div>
            <span className="text-white/50 text-xs">Press ESC to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
