"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EditIcon, BookOpenIcon, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InstructorCourse } from "@/app/api/course/getInstructorCourses";
import { publishCourse } from "@/app/api/course/publishCourse";

interface DraftCourseCardProps {
  course: InstructorCourse;
  onEdit?: (courseId: string) => void; // Kept for backwards compatibility but not used
  onPublish?: () => void; // Callback to refresh after publishing
}

// Calculate progress based on required fields for publishing
// Note: Finalize messages are checked on the backend before publishing
function calculateProgress(course: InstructorCourse): number {
  const fields = {
    // Step 1: Basic info (Course Details)
    title: !!course.title,
    shortDescription: !!course.shortDescription,
    learningLevel: !!course.learningLevel,
    language: !!course.language,
    categoryId: !!course.categoryId,
    courseBannerId: course.courseBannerId !== null && course.courseBannerId > 0,
    // Note: courseLogoId is optional, not required for publishing
    
    // Step 2: Curriculum
    hasLectures: course.totalLectures > 0,
    hasDuration: course.totalDuration > 0,
    
    // Step 3: Pricing
    hasPricing: course.price !== null && course.price !== undefined,
    
    // Step 4: Finalize (messages are required but not returned in list API)
    // We assume if all above steps are complete, finalize is also complete
    // since the course can only be in draft with all fields if finalize is done
  };

  const totalFields = Object.keys(fields).length;
  const completedFields = Object.values(fields).filter(Boolean).length;
  
  // If all required fields are complete, it's 100% ready to publish
  return Math.round((completedFields / totalFields) * 100);
}

export function DraftCourseCard({ course, onPublish }: DraftCourseCardProps) {
  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const actualProgress = calculateProgress(course);
  const isComplete = actualProgress === 100;

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

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsPublishing(true);
      await publishCourse(course.courseId, {
        isDraft: false,
      });
      
      // Refresh the dashboard to show updated courses
      if (onPublish) {
        onPublish();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to publish course:", error);
      // You could show a toast notification here
    } finally {
      setIsPublishing(false);
    }
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
      {isComplete ? (
        <Button
          className="w-full gap-2 bg-success-600 hover:bg-success-700 text-white shadow-md hover:shadow-lg transition-all"
          onClick={handlePublish}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <RocketIcon className="size-4" />
              Publish Course
            </>
          )}
        </Button>
      ) : (
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
      )}
    </div>
  );
}

