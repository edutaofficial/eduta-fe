"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseContent,
  type Lecture,
  type Section,
} from "@/app/api/learner/getCourseContent";
import {
  updateProgress,
  type UpdateProgressRequest,
} from "@/app/api/learner/updateProgress";
import { LectureHeader } from "@/components/Learn/LectureHeader";
import { LectureSidebar } from "@/components/Learn/LectureSidebar";
import { VideoJSHlsPlayer } from "@/components/Learn/VideoJSHlsPlayer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useUpload } from "@/hooks/useUpload";

// Helper to find lecture by ID
function findLectureById(sections: Section[], lectureId: string) {
  for (const section of sections) {
    const lecture = section.lectures.find((l) => l.lectureId === lectureId);
    if (lecture) {
      return { lecture, section };
    }
  }
  return null;
}

// Helper to find next/previous lecture
function findAdjacentLecture(
  sections: Section[],
  currentLectureId: string,
  direction: "next" | "previous"
): Lecture | null {
  const allLectures: Lecture[] = [];
  sections.forEach((section) => {
    allLectures.push(...section.lectures);
  });

  const currentIndex = allLectures.findIndex(
    (l) => l.lectureId === currentLectureId
  );

  if (currentIndex === -1) return null;

  if (direction === "next") {
    return allLectures[currentIndex + 1] || null;
  } else {
    return allLectures[currentIndex - 1] || null;
  }
}

// Helper to find first incomplete lecture
function findFirstIncompleteLecture(sections: Section[]): Lecture | null {
  for (const section of sections) {
    const incompleteLecture = section.lectures.find((l) => !l.isCompleted);
    if (incompleteLecture) return incompleteLecture;
  }
  // If all completed, return first lecture
  return sections[0]?.lectures[0] || null;
}

// Helper to format duration (duration is already in minutes from API)
function _formatDuration(minutes: number): string {
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

export default function LecturePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGetAssetById } = useUpload();

  const courseId = params.courseId as string;
  const lectureIdParam = params.lectureId as string;

  const [showCongratulations, setShowCongratulations] = React.useState(false);
  const [certificateGenerated, setCertificateGenerated] = React.useState(false);

  // Track if we've already shown congratulations for this course in this session
  const congratsShownKeyRef = React.useRef(`congrats-shown-${courseId}`);
  const hasShownCongratsRef = React.useRef(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progressToast, setProgressToast] = React.useState<string | null>(null);
  const [currentVideoPosition, setCurrentVideoPosition] =
    React.useState<number>(0);

  // Track if component is mounted to prevent updates after unmount
  const isMountedRef = React.useRef(true);

  // Check on mount if we've already shown congratulations for this course
  React.useEffect(() => {
    const shownKey = congratsShownKeyRef.current;
    try {
      const alreadyShown = localStorage.getItem(shownKey) === "true";
      hasShownCongratsRef.current = alreadyShown;
    } catch (e) {
      // If localStorage is not available, just continue
      console.warn("localStorage not available:", e);
    }
  }, []);

  // Track progress errors separately
  const progressErrorCountRef = React.useRef(0);
  const progressErrorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Track current video position for complete action (ref for immediate access)
  const currentVideoPositionRef = React.useRef<number>(0);

  // Fetch course content
  const {
    data: courseContent,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["courseContent", courseId],
    queryFn: () => getCourseContent(courseId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Redirect to first incomplete lecture if lectureId is "0" or "lectures"
  React.useEffect(() => {
    if (
      courseContent &&
      (lectureIdParam === "0" || lectureIdParam === "lectures")
    ) {
      const firstIncompleteLecture = findFirstIncompleteLecture(
        courseContent.sections
      );
      if (firstIncompleteLecture) {
        // eslint-disable-next-line no-console
        console.log(
          "🎯 Redirecting to first incomplete lecture:",
          firstIncompleteLecture.lectureId
        );
        router.replace(
          `/learn/${courseId}/${firstIncompleteLecture.lectureId}`
        );
      }
    }
  }, [courseContent, lectureIdParam, courseId, router]);

  // Get current lecture
  const currentLectureData = React.useMemo(() => {
    if (
      !courseContent ||
      lectureIdParam === "0" ||
      lectureIdParam === "lectures"
    )
      return null;
    return findLectureById(courseContent.sections, lectureIdParam);
  }, [courseContent, lectureIdParam]);

  const currentLecture = currentLectureData?.lecture;

  // Find adjacent lectures
  const nextLecture = React.useMemo(() => {
    if (!courseContent || !currentLecture) return null;
    return findAdjacentLecture(
      courseContent.sections,
      currentLecture.lectureId,
      "next"
    );
  }, [courseContent, currentLecture]);

  const previousLecture = React.useMemo(() => {
    if (!courseContent || !currentLecture) return null;
    return findAdjacentLecture(
      courseContent.sections,
      currentLecture.lectureId,
      "previous"
    );
  }, [courseContent, currentLecture]);

  // Separate mutation for completing lectures (manual complete button)
  const completeLectureMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      // eslint-disable-next-line no-console
      console.log("✅ Lecture marked as complete - API Response:", data);
      // eslint-disable-next-line no-console
      console.log("✅ Lecture isCompleted from API:", data.isCompleted);

      // Show congratulations if course is completed (only if not shown before)
      if (
        data.courseCompleted &&
        !showCongratulations &&
        !hasShownCongratsRef.current
      ) {
        setShowCongratulations(true);
        setCertificateGenerated(data.certificateGenerated);
        // Mark as shown in local storage so it won't show again
        try {
          localStorage.setItem(congratsShownKeyRef.current, "true");
        } catch (e) {
          console.warn("Failed to save to localStorage:", e);
        }
        hasShownCongratsRef.current = true;
      }

      // Invalidate and refetch queries to refresh sidebar with updated completion status
      queryClient.invalidateQueries({
        queryKey: ["courseContent", courseId],
        refetchType: "active",
      });

      // Auto-navigate to next lecture after a short delay
      if (nextLecture) {
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push(`/learn/${courseId}/${nextLecture.lectureId}`);
          }
        }, 500);
      }
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err);
      // eslint-disable-next-line no-console
      console.error("❌ Failed to mark lecture as complete:", errorMessage);
      // eslint-disable-next-line no-console
      console.error("❌ Full error:", err);
      // Could show a toast here if needed
    },
  });

  // Progress update mutation - COMPLETELY ISOLATED from video playback
  const progressMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      // Reset error count on successful update
      progressErrorCountRef.current = 0;

      // IMPORTANT: Don't invalidate queries during playback - only update on completion
      // This prevents re-renders that could affect video playback

      // Show congratulations if course is completed (only from video end, not manual complete)
      // Only show if not already shown before
      if (
        data.courseCompleted &&
        !showCongratulations &&
        !hasShownCongratsRef.current
      ) {
        setShowCongratulations(true);
        setCertificateGenerated(data.certificateGenerated);
        // Mark as shown in local storage so it won't show again
        try {
          localStorage.setItem(congratsShownKeyRef.current, "true");
        } catch (e) {
          console.warn("Failed to save to localStorage:", e);
        }
        hasShownCongratsRef.current = true;
      }

      // Invalidate and refetch sidebar when lecture is completed (from video end)
      if (data.isCompleted) {
        queryClient.invalidateQueries({
          queryKey: ["courseContent", courseId],
          refetchType: "active",
        });
      }
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err);

      // Increment error count
      progressErrorCountRef.current += 1;

      // Log to console for debugging
      // eslint-disable-next-line no-console
      console.warn(
        `⚠️ Progress tracking failed (${progressErrorCountRef.current}x):`,
        errorMessage
      );

      // After 3 consecutive failures, show toast notification
      if (progressErrorCountRef.current >= 3) {
        // eslint-disable-next-line no-console
        console.error(
          "❌ Progress tracking unavailable. Showing user notification."
        );

        // Only show toast if component is still mounted
        if (isMountedRef.current) {
          setProgressToast(
            "Your progress cannot be saved at the moment. The lecture will continue, but your progress may not sync. Please check your connection."
          );

          // Clear any existing toast timeout
          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }

          // Auto-dismiss after 10 seconds
          toastTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setProgressToast(null);
            }
          }, 10000);
        }

        // Reset counter to avoid spam (will show again after 3 more failures)
        progressErrorCountRef.current = 0;
      }
    },
    // CRITICAL: Configure mutation to not throw errors
    retry: false, // Don't retry failed progress updates
    retryDelay: 0,
  });

  // Debounced progress update
  const pendingProgressRef = React.useRef<UpdateProgressRequest | null>(null);
  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedProgressUpdate = React.useCallback(
    (payload: UpdateProgressRequest) => {
      if (!isMountedRef.current) return; // Don't update if unmounted

      pendingProgressRef.current = payload;

      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }

      progressTimerRef.current = setTimeout(() => {
        if (pendingProgressRef.current && isMountedRef.current) {
          // eslint-disable-next-line no-console
          console.log("📊 Sending progress update:", {
            lecture: pendingProgressRef.current.lecture_id,
            position: pendingProgressRef.current.last_position,
            completed: pendingProgressRef.current.is_completed,
          });
          progressMutation.mutate(pendingProgressRef.current);
          pendingProgressRef.current = null;
        }
      }, 2000); // 2 second debounce
    },
    [progressMutation]
  );

  // Handle video progress update - STABLE REFERENCE
  const handleProgressUpdate = React.useCallback(
    (currentTime: number, _duration: number) => {
      // Update both ref and state for current video position
      currentVideoPositionRef.current = currentTime;
      setCurrentVideoPosition(currentTime); // For sidebar real-time updates

      // Use refs to avoid re-creating this callback
      const { enrollmentId } = courseContent || {};
      const { lectureId, isCompleted } = currentLecture || {};

      if (!courseContent || !currentLecture || !enrollmentId || !lectureId) {
        return;
      }

      // Validate progress data
      if (currentTime < 0 || !isFinite(currentTime)) {
        return;
      }

      debouncedProgressUpdate({
        enrollment_id: enrollmentId,
        lecture_id: lectureId,
        is_completed: isCompleted || false,
        watch_time: Math.floor(currentTime),
        last_position: Math.floor(currentTime),
      });
    },
    [courseContent, currentLecture, debouncedProgressUpdate]
  );

  // Handle video end - STABLE REFERENCE
  const handleVideoEndRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    handleVideoEndRef.current = () => {
      if (!courseContent || !currentLecture) {
        return;
      }

      if (progressMutation.isPending) {
        return;
      }

      // eslint-disable-next-line no-console
      console.log("🎬 Video ended, marking as complete");

      progressMutation.mutate({
        enrollment_id: courseContent.enrollmentId,
        lecture_id: currentLecture.lectureId,
        is_completed: true,
        watch_time: currentLecture.duration || 0,
        last_position: currentLecture.duration || 0,
      });

      // Auto-navigate to next lecture
      if (nextLecture) {
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push(`/learn/${courseId}/${nextLecture.lectureId}`);
          }
        }, 1500);
      }
    };
  }, [
    courseContent,
    currentLecture,
    nextLecture,
    courseId,
    router,
    progressMutation,
  ]);

  const handleVideoEnd = React.useCallback(() => {
    handleVideoEndRef.current?.();
  }, []);

  // Handle complete button
  const handleComplete = React.useCallback(() => {
    if (!courseContent || !currentLecture) {
      // eslint-disable-next-line no-console
      console.warn(
        "❌ Cannot complete: Missing courseContent or currentLecture"
      );
      return;
    }

    if (completeLectureMutation.isPending) {
      // eslint-disable-next-line no-console
      console.warn("⏳ Completion already in progress");
      return;
    }

    // Get the current video position from the ref
    const currentPosition = Math.floor(currentVideoPositionRef.current);

    const payload = {
      enrollment_id: courseContent.enrollmentId,
      lecture_id: currentLecture.lectureId,
      is_completed: true, // Always mark as completed
      watch_time: Math.max(currentPosition, currentLecture.watchTime || 0), // Use whichever is higher
      last_position: currentPosition, // Send current position for resume capability
    };

    // eslint-disable-next-line no-console
    console.log("🔵 Complete Button Clicked - Sending Payload:", payload);
    // eslint-disable-next-line no-console
    console.log("🔵 is_completed value:", payload.is_completed);
    // eslint-disable-next-line no-console
    console.log("🔵 Current video position:", currentPosition);

    // Mark as completed and send current video position
    completeLectureMutation.mutate(payload);
  }, [courseContent, currentLecture, completeLectureMutation]);

  // Navigation handlers
  const handleBack = () => {
    router.push("/student/courses");
  };

  const handlePrevious = () => {
    if (previousLecture) {
      router.push(`/learn/${courseId}/${previousLecture.lectureId}`);
    }
  };

  const handleNext = () => {
    if (nextLecture) {
      router.push(`/learn/${courseId}/${nextLecture.lectureId}`);
    }
  };

  const handleLectureClick = (lectureId: string) => {
    router.push(`/learn/${courseId}/${lectureId}`);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;

    return () => {
      // eslint-disable-next-line no-console
      console.log("🔄 Lecture player unmounting, cleaning up...");
      isMountedRef.current = false;

      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (progressErrorTimeoutRef.current) {
        clearTimeout(progressErrorTimeoutRef.current);
        progressErrorTimeoutRef.current = null;
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      // Clear pending progress - don't send on unmount to avoid network errors
      pendingProgressRef.current = null;
      progressErrorCountRef.current = 0;
    };
  }, []);

  // Error handling
  React.useEffect(() => {
    if (queryError) {
      setError(extractErrorMessage(queryError));
    }
  }, [queryError]);

  // Get video asset details to retrieve the actual video URL
  const { data: videoAsset, isLoading: videoAssetLoading } = useGetAssetById(
    currentLecture?.videoId || 0
  );

  // Extract video URL from asset (use presigned_url for S3 access)
  const videoUrl = React.useMemo(() => {
    if (!videoAsset) return "";

    // Use presigned_url if available (for S3 signed access), otherwise fall back to file_url
    const url = videoAsset.presigned_url || videoAsset.file_url;

    // eslint-disable-next-line no-console
    console.log("Video Asset:", videoAsset);
    // eslint-disable-next-line no-console
    console.log("Using Video URL:", url);

    return url;
  }, [videoAsset]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-default-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-default-900 mb-2">
            Failed to load course
          </h1>
          <p className="text-default-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/student/courses")}
            className="text-primary-600 hover:underline"
          >
            Go back to courses
          </button>
        </div>
      </div>
    );
  }

  const loading =
    isLoading ||
    lectureIdParam === "0" ||
    lectureIdParam === "lectures" ||
    videoAssetLoading;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Progress Error Toast - Non-intrusive notification */}
      {progressToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-default-900/95 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3 max-w-md border border-warning-500/30">
            <div className="shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-warning-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-relaxed">
                {progressToast}
              </p>
            </div>
            <button
              onClick={() => {
                setProgressToast(null);
                if (toastTimeoutRef.current) {
                  clearTimeout(toastTimeoutRef.current);
                }
              }}
              className="shrink-0 text-default-400 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <LectureHeader
        lectureName={currentLecture?.title || ""}
        onComplete={handleComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onBack={handleBack}
        canGoPrevious={!!previousLecture}
        hasNextLecture={!!nextLecture}
        isCompleted={currentLecture?.isCompleted || false}
        isCompletingLecture={completeLectureMutation.isPending}
        loading={loading}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 flex items-center justify-center bg-default-900">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p>Loading lecture...</p>
              </div>
            </div>
          ) : currentLecture && videoUrl ? (
            <VideoJSHlsPlayer
              videoUrl={videoUrl}
              startPosition={currentLecture.lastPosition}
              onProgressUpdate={handleProgressUpdate}
              onVideoEnd={handleVideoEnd}
              className="w-full h-full"
            />
          ) : (
            <div className="text-white text-center p-8">
              <p className="text-lg">
                {currentLecture
                  ? "No video available for this lecture"
                  : "Lecture not found"}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {courseContent && (
          <LectureSidebar
            sections={courseContent.sections}
            currentLectureId={lectureIdParam}
            currentVideoPosition={currentVideoPosition}
            onLectureClick={handleLectureClick}
            overallProgress={courseContent.overallProgress}
            completedLectures={courseContent.completedLectures}
            totalLectures={courseContent.totalLectures}
            loading={loading}
          />
        )}
      </div>

      {/* Congratulations Dialog */}
      <AlertDialog
        open={showCongratulations}
        onOpenChange={setShowCongratulations}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              🎉 Congratulations!
            </AlertDialogTitle>
            <div className="space-y-2">
              <AlertDialogDescription>
                You have successfully completed the course:{" "}
                <strong>{courseContent?.title}</strong>
              </AlertDialogDescription>
              {certificateGenerated && (
                <p className="text-success-600 font-medium text-sm">
                  Your certificate has been generated and is available in your
                  certificates section.
                </p>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCongratulations(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCongratulations(false);
                if (certificateGenerated) {
                  router.push("/student/certificates");
                } else {
                  router.push("/student/courses");
                }
              }}
            >
              {certificateGenerated ? "View Certificate" : "Go to Courses"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
