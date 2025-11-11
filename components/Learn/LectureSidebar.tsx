"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, PlayCircleIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Section, Lecture } from "@/app/api/learner/getCourseContent";

interface LectureSidebarProps {
  sections: Section[];
  currentLectureId: string;
  onLectureClick: (lectureId: string) => void;
  overallProgress: number;
  completedLectures: number;
  totalLectures: number;
  loading?: boolean;
}

export function LectureSidebar({
  sections,
  currentLectureId,
  onLectureClick,
  overallProgress,
  completedLectures,
  totalLectures,
  loading = false,
}: LectureSidebarProps) {
  if (loading) {
    return (
      <aside className="w-96 bg-white border-l border-default-200 flex flex-col h-full">
        <div className="p-6 border-b border-default-200 flex-shrink-0">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-auto">
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
    <aside className="w-96 bg-white border-l border-default-200 flex flex-col h-full">
      {/* Progress Header - Fixed */}
      <div className="p-6 border-b border-default-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-default-900 mb-4">
          Course Progress
        </h2>
        <Progress value={overallProgress} className="mb-2 h-2" />
        <p className="text-sm text-default-600">
          {completedLectures} of {totalLectures} lectures completed
        </p>
      </div>

      {/* Sections & Lectures - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.sectionId} className="space-y-2">
              {/* Section Header */}
              <div className="sticky top-0 bg-white z-10 pb-2">
                <h3 className="font-semibold text-default-900 text-sm">
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
                    onClick={() => onLectureClick(lecture.lectureId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

interface LectureItemProps {
  lecture: Lecture;
  lectureNumber: number;
  isActive: boolean;
  onClick: () => void;
}

function LectureItem({ lecture, lectureNumber, isActive, onClick }: LectureItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2.5 flex items-center gap-3 rounded-md transition-all text-left group",
        isActive
          ? "bg-primary-600 text-white shadow-md"
          : "hover:bg-default-100 text-default-900"
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {lecture.isCompleted ? (
          <CheckCircle2Icon
            className={cn(
              "size-5",
              isActive ? "text-white" : "text-success-600"
            )}
          />
        ) : isActive ? (
          <PlayCircleIcon className="size-5 text-white" />
        ) : (
          <div
            className={cn(
              "size-5 rounded-full border-2 flex items-center justify-center text-xs font-medium",
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
            "text-sm font-medium line-clamp-2",
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
          {lecture.durationFormatted}
        </p>
      </div>

      {/* Progress Indicator */}
      {!lecture.isCompleted && lecture.watchTime > 0 && (
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-12 h-1.5 rounded-full overflow-hidden",
              isActive ? "bg-primary-800" : "bg-default-200"
            )}
          >
            <div
              className={cn(
                "h-full transition-all",
                isActive ? "bg-white" : "bg-primary-600"
              )}
              style={{
                width: `${Math.min(
                  (lecture.watchTime / lecture.duration) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

