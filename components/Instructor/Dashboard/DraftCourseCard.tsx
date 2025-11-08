"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EditIcon, BookOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InstructorCourse } from "@/app/api/course/getInstructorCourses";

interface DraftCourseCardProps {
  course: InstructorCourse;
  onEdit?: (courseId: string) => void; // Kept for backwards compatibility but not used
}

// Calculate progress based on filled fields
function calculateProgress(course: InstructorCourse): number {
  const fields = {
    // Basic info
    title: !!course.title,
    shortDescription: !!course.shortDescription,
    learningLevel: !!course.learningLevel,
    language: !!course.language,
    categoryId: !!course.categoryId,
    // Media assets
    courseBannerId: course.courseBannerId !== null && course.courseBannerId > 0,
    courseLogoId: course.courseLogoId !== null && course.courseLogoId > 0,
    // Curriculum
    hasLectures: course.totalLectures > 0,
    hasDuration: course.totalDuration > 0,
    // Pricing
    hasPricing: course.price >= 0,
  };

  const totalFields = Object.keys(fields).length;
  const completedFields = Object.values(fields).filter(Boolean).length;

  return Math.round((completedFields / totalFields) * 100);
}

export function DraftCourseCard({ course }: DraftCourseCardProps) {
  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const actualProgress = calculateProgress(course);

  // Animate progress on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(actualProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [actualProgress]);

  const handleEdit = () => {
    router.push(`/instructor/courses/${course.courseId}/draft-complete`);
  };

  return (
    <div
      className={cn(
        "group bg-white rounded-xl shadow-sm border border-default-200",
        "p-6 space-y-4 transition-all duration-200",
        "hover:shadow-lg hover:border-primary-200 hover:-translate-y-1",
        "cursor-pointer"
      )}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleEdit();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Course Icon and Title */}
      <div className="flex items-start gap-4">
        <div className="size-14 rounded-xl bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0 border border-primary-200 shadow-sm transition-transform group-hover:scale-110">
          <BookOpenIcon className="size-7 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-default-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
            {course.title || "Untitled Course"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5">
            {course.instructorName || "Instructor"}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="font-bold text-primary-600 text-base">
            {progress}%
          </span>
        </div>
        <div className="space-y-1.5">
          <Progress
            value={progress}
            className="h-2.5 transition-all duration-1000 ease-out"
          />
          <p className="text-xs text-muted-foreground">
            {progress < 100
              ? `${100 - progress}% remaining to complete`
              : "Ready to publish!"}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        className="w-full gap-2 border-primary-200 text-primary-600 hover:bg-primary-50 hover:border-primary-300 group-hover:shadow-md transition-all"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit();
        }}
      >
        <EditIcon className="size-4" />
        Continue Editing
      </Button>
    </div>
  );
}

