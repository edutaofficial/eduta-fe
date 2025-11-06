"use client";

import * as React from "react";
import Image from "next/image";
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
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCourseStore } from "@/store/useCourseStore";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/api/axiosInstance";
import type { Asset } from "@/types/course";
import FAQComponent from "../Home/FAQ";

interface CourseDetailProps {
  courseId?: string;
  isPreview?: boolean;
  onBack?: () => void;
}

interface CourseData {
  id?: string;
  category?: string;
  subCategory?: string;
  title: string;
  subHeading?: string;
  duration?: string;
  exercises?: string;
  projects?: string;
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
    }>;
  }>;
  promoVideo?: string | number | null;
  instructor?: {
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

// Helper to get asset URL from asset ID
function useAssetUrl(assetId: number | string | null | undefined) {
  const id = typeof assetId === "string" ? parseInt(assetId, 10) : assetId;
  const { data: asset } = useQuery<Asset | null>({
    queryKey: ["asset", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await axiosInstance.get<Asset>(`/api/v1/assets/${id}`);
      return data;
    },
    enabled: !!id && typeof id === "number",
  });
  return asset?.file_url || null;
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
  if (!duration) return "0:00";
  if (typeof duration === "number") {
    // Assume minutes
    const mins = Math.floor(duration);
    const secs = Math.round((duration - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return duration; // Already formatted string
}

export function CourseDetail({
  courseId,
  isPreview = false,
  onBack,
}: CourseDetailProps) {
  const { basicInfo, curriculum, pricing } = useCourseStore();
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showAllSections, setShowAllSections] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  // Get asset URLs
  const promoVideoUrl = useAssetUrl(basicInfo.promoVideoId);

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
    // If preview mode, use store data
    if (isPreview) {
      const categoryName = "Category"; // You might want to fetch this from categories

      return {
        id: courseId,
        category: categoryName,
        subCategory: basicInfo.learningLevel || "",
        title: basicInfo.title || "Untitled Course",
        subHeading: categoryName,
        duration: formatDuration(totalDuration),
        exercises: "0",
        projects: "0",
        rating: 0,
        ratingCount: 0,
        enrollments: 0,
        learningPoints: basicInfo.learningPoints.map((lp) => lp.description),
        description: basicInfo.description || "",
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
        promoVideo: promoVideoUrl || basicInfo.promoVideoId,
        instructor: {
          name: "Instructor", // You might want to get this from user context
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
    isPreview,
    courseId,
    basicInfo,
    curriculum,
    totalDuration,
    promoVideoUrl,
  ]);

  // Use asset URLs for images/videos
  // For promo video, check if it's actually a video file or image
  const promoVideoSrc = React.useMemo(() => {
    // Check promoVideoUrl first (from asset API)
    if (promoVideoUrl) {
      // If it's a video file, use a placeholder image instead
      if (
        promoVideoUrl.includes(".mp4") ||
        promoVideoUrl.includes(".mov") ||
        promoVideoUrl.includes(".avi")
      ) {
        return "https://placehold.co/1280x720/2977A9/FFFFFF/png?text=Course+Promo+Video";
      }
      return promoVideoUrl;
    }

    // Check courseData.promoVideo
    if (typeof courseData.promoVideo === "string" && courseData.promoVideo) {
      // If it's a video URL, use placeholder
      if (
        courseData.promoVideo.includes(".mp4") ||
        courseData.promoVideo.includes(".mov") ||
        courseData.promoVideo.includes(".avi")
      ) {
        return "https://placehold.co/1280x720/2977A9/FFFFFF/png?text=Course+Promo+Video";
      }
      return courseData.promoVideo;
    }

    // Default placeholder
    return "https://placehold.co/1280x720/2977A9/FFFFFF/png?text=Course+Promo+Video";
  }, [courseData.promoVideo, promoVideoUrl]);

  const instructorAvatarSrc =
    typeof courseData.instructor?.avatar === "string" &&
    courseData.instructor.avatar
      ? courseData.instructor.avatar
      : "https://i.pravatar.cc/150?img=1";

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
                  <span className="text-default-400">•</span>
                  <span>{courseData.exercises || "0"} exercises</span>
                  <span className="text-default-400">•</span>
                  <span>{courseData.projects || "0"} projects</span>
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
                  <Accordion type="multiple" className="w-full">
                    {(showAllSections
                      ? courseData.outline
                      : courseData.outline.slice(0, 4)
                    ).map((section, sectionIndex) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-default-900 font-medium">
                              Section {sectionIndex + 1}: {section.title}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {section.lectures.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="flex items-center justify-between py-2 px-3 hover:bg-default-100 rounded-md transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <VideoIcon className="size-5 text-error-700 shrink-0" />
                                  <span className="text-default-700 font-medium">
                                    {lecture.id}
                                  </span>
                                  <span className="text-default-700">
                                    {lecture.title}
                                  </span>
                                </div>
                                <span className="text-sm text-default-600">
                                  {formatLectureDuration(lecture.duration)}
                                </span>
                              </div>
                            ))}
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
                    {!showFullDescription && (
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

              {/* Why This Course - Reviews */}
              {courseData.reviews && courseData.reviews.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-default-900">
                    Why This Course?
                  </h2>
                  <Slider
                    slidesPerView={1}
                    spaceBetween={16}
                    navigation={{
                      enabled: true,
                      position: "center",
                      showArrows: true,
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
                    {courseData.reviews.map((review) => (
                      <div
                        key={review.id}
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
                          <span className="text-sm font-semibold text-default-900">
                            {review.userName}
                          </span>
                        </div>
                        <p className="text-default-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </Slider>
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
                      <AvatarImage
                        src={instructorAvatarSrc}
                        alt={courseData.instructor.name}
                      />
                      <AvatarFallback>
                        {courseData.instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-xl font-semibold text-default-900">
                          {courseData.instructor.name}
                        </h3>
                        <p className="text-default-600">
                          {courseData.instructor.title}
                        </p>
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
                  {/* Promo Video */}
                  <div className="relative aspect-video bg-default-100 group cursor-pointer">
                    <Image
                      src={promoVideoSrc}
                      alt="Course promo video"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                        <PlayIcon className="size-8 text-primary-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-default-900 line-clamp-2">
                      {courseData.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-default-700">
                      <span>{courseData.duration || "0 hours"}</span>
                      <span className="text-default-400">•</span>
                      <span>{courseData.exercises || "0"} exercises</span>
                      <span className="text-default-400">•</span>
                      <span>{courseData.projects || "0"} projects</span>
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
                          <Button
                            className="w-full bg-primary-400 hover:bg-primary-500 text-white"
                            size="lg"
                          >
                            Enroll Now
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsWishlisted(!isWishlisted)}
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
    </div>
  );
}
