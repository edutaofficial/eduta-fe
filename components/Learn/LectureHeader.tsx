"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LectureHeaderProps {
  lectureName: string;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onBack: () => void;
  canGoPrevious: boolean;
  hasNextLecture: boolean;
  isCompleted: boolean;
  isCompletingLecture?: boolean;
  loading?: boolean;
}

export function LectureHeader({
  lectureName,
  onComplete,
  onNext,
  onPrevious,
  onBack,
  canGoPrevious,
  hasNextLecture,
  isCompleted,
  isCompletingLecture = false,
  loading = false,
}: LectureHeaderProps) {
  if (loading) {
    return (
      <header className="bg-white border-b border-default-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between max-w-[100rem] mx-auto">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-default-200 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between max-w-[100rem] mx-auto">
        {/* Left: Back Button + Lecture Name */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2 sm:mr-4">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            title="Back to courses"
          >
            <ArrowLeft className="size-4 sm:size-5" />
          </Button>

          {/* Lecture Name */}
          <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-default-900 truncate">
            {lectureName}
          </h1>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Previous Button */}
          <Button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4"
          >
            <ChevronLeftIcon className="size-3 sm:size-4" />
            <span className="hidden xs:inline">Previous</span>
          </Button>

          {/* Complete/Next Button */}
          <Button
            onClick={isCompleted ? onNext : onComplete}
            disabled={isCompletingLecture || (isCompleted && !hasNextLecture)}
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className="flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-4"
          >
            {isCompletingLecture ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                <span className="hidden xs:inline">Completing...</span>
              </>
            ) : isCompleted ? (
              <>
                <span className="hidden xs:inline">Next</span>
                <span className="xs:hidden">Next</span>
                {hasNextLecture && <ChevronRightIcon className="size-3 sm:size-4" />}
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Complete & Next</span>
                <span className="sm:hidden">Complete</span>
                {hasNextLecture && <ChevronRightIcon className="size-3 sm:size-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
