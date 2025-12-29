"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, PlayCircleIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Section, Lecture } from "@/app/api/learner/getCourseContent";

interface LectureSidebarProps {
  sections: Section[];
  currentLectureId: string;
  currentVideoPosition: number;
  onLectureClick: (lectureId: string, lectureTitle: string) => void;
  overallProgress: number;
  completedLectures: number;
  totalLectures: number;
  loading?: boolean;
}

// Helper to format duration (duration is already in minutes from API)
function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return "0m";

  // If 60 minutes or more, show in "XhYm" format (no space)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
  }

  // Otherwise show in "Xm" format
  return `${minutes}m`;
}

export function LectureSidebar({
  sections,
  currentLectureId,
  currentVideoPosition,
  onLectureClick,
  overallProgress,
  completedLectures,
  totalLectures,
  loading = false,
}: LectureSidebarProps) {
  if (loading) {
    return (
      <aside className="hidden lg:flex w-80 xl:w-96 bg-white border-l border-default-200 flex-col h-full">
        <div className="p-4 xl:p-6 border-b border-default-200 shrink-0">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 p-3 xl:p-4 space-y-4 overflow-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex w-80 xl:w-96 bg-white border-l border-default-200 flex-col h-full">
      {/* Progress Header - Fixed */}
      <div className="p-4 xl:p-6 border-b border-default-200 shrink-0">
        <h2 className="text-base xl:text-lg font-semibold text-default-900 mb-3 xl:mb-4">
          Course Progress
        </h2>
        <Progress value={overallProgress} className="mb-2 h-2" />
        <p className="text-xs xl:text-sm text-default-600">
          {completedLectures} of {totalLectures} lectures completed
        </p>
      </div>

      {/* Sections & Lectures - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        <div className="p-3 xl:p-4 space-y-4 xl:space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.sectionId} className="space-y-2">
              {/* Section Header */}
              <div className="sticky top-0 bg-white z-10 pb-2">
                <h3 className="font-semibold text-default-900 text-xs xl:text-sm">
                  Section {sectionIndex + 1}: {section.title}
                </h3>
                <p className="text-xs text-default-600 mt-1">
                  {section.completedLectures}/{section.lectureCount} lectures •{" "}
                  {Math.round(section.progressPercentage)}% complete
                </p>
              </div>

              {/* Lectures */}
              <div className="space-y-1">
                {section.lectures.map((lecture, lectureIndex) => (
                  <LectureItem
                    key={lecture.lectureId}
                    lecture={lecture}
                    lectureNumber={lectureIndex + 1}
                    isActive={lecture.lectureId === currentLectureId}
                    currentVideoPosition={currentVideoPosition}
                    onClick={() => onLectureClick(lecture.lectureId, lecture.title)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

interface LectureItemProps {
  lecture: Lecture;
  lectureNumber: number;
  isActive: boolean;
  currentVideoPosition: number;
  onClick: () => void;
}

function LectureItem({
  lecture,
  lectureNumber,
  isActive,
  currentVideoPosition,
  onClick,
}: LectureItemProps) {
  // Use real-time position if this is the active lecture, otherwise use saved watchTime
  const displayWatchTime = isActive
    ? Math.floor(currentVideoPosition)
    : lecture.watchTime;

  // Convert duration from minutes to seconds for progress calculation
  const durationInSeconds = lecture.duration * 60;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-2 xl:px-3 py-2 xl:py-2.5 flex items-center gap-2 xl:gap-3 rounded-md transition-all text-left group",
        isActive
          ? "bg-primary-600 text-white shadow-md"
          : "hover:bg-default-100 text-default-900"
      )}
    >
      {/* Status Icon */}
      <div className="shrink-0">
        {lecture.isCompleted ? (
          <CheckCircle2Icon
            className={cn(
              "size-4 xl:size-5",
              isActive ? "text-white" : "text-success-600"
            )}
          />
        ) : isActive ? (
          <PlayCircleIcon className="size-4 xl:size-5 text-white" />
        ) : (
          <div
            className={cn(
              "size-4 xl:size-5 rounded-full border-2 flex items-center justify-center text-xs font-medium",
              "border-default-300 text-default-600"
            )}
          >
            {lectureNumber}
          </div>
        )}
      </div>

      {/* Lecture Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "text-xs xl:text-sm font-medium line-clamp-2",
            isActive ? "text-white" : "text-default-900"
          )}
        >
          {lecture.title}
        </h4>
        <p
          className={cn(
            "text-xs mt-0.5",
            isActive ? "text-primary-100" : "text-default-600"
          )}
        >
          {formatDuration(lecture.duration)}
        </p>
      </div>

      {/* Progress Percentage - Show for all lectures with progress > 0% and < 100% */}
      {displayWatchTime > 0 && displayWatchTime < durationInSeconds && (
        <div className="shrink-0">
          <span
            className={cn(
              "text-xs font-medium",
              isActive ? "text-white" : "text-primary-600"
            )}
          >
            {Math.round((displayWatchTime / durationInSeconds) * 100)}%
          </span>
        </div>
      )}
    </button>
  );
}
