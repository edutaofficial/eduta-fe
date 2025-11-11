"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LectureHeaderProps {
  lectureName: string;
  onComplete: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isCompleted: boolean;
  isCompletingLecture?: boolean;
  loading?: boolean;
}

export function LectureHeader({
  lectureName,
  onComplete,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isCompleted,
  isCompletingLecture = false,
  loading = false,
}: LectureHeaderProps) {
  if (loading) {
    return (
      <header className="bg-white border-b border-default-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between max-w-[100rem] mx-auto">
          <Skeleton className="h-6 w-64" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-default-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between max-w-[100rem] mx-auto">
        {/* Left: Lecture Name */}
        <div className="flex-1 min-w-0 mr-4">
          <h1 className="text-xl font-semibold text-default-900 truncate">
            {lectureName}
          </h1>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onComplete}
            disabled={isCompleted || isCompletingLecture}
            variant={isCompleted ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            <CheckIcon className="size-4" />
            {isCompletingLecture
              ? "Completing..."
              : isCompleted
                ? "Completed"
                : "Complete"}
          </Button>

          <Button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            variant="outline"
            size="icon"
            title="Previous Lecture"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            variant="outline"
            size="icon"
            title="Next Lecture"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

