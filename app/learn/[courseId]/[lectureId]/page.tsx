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
import { VideoPlayer } from "@/components/Learn/VideoPlayer";
import {
  AlertDialog,
  AlertDialogAction,
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

export default function LecturePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGetAssetById } = useUpload();

  const courseId = params.courseId as string;
  const lectureIdParam = params.lectureId as string;

  const [showCongratulations, setShowCongratulations] = React.useState(false);
  const [certificateGenerated, setCertificateGenerated] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  // Redirect to first incomplete lecture if lectureId is "0"
  React.useEffect(() => {
    if (courseContent && lectureIdParam === "0") {
      const firstIncompleteLecture = findFirstIncompleteLecture(
        courseContent.sections
      );
      if (firstIncompleteLecture) {
        router.replace(
          `/learn/${courseId}/${firstIncompleteLecture.lectureId}`
        );
      }
    }
  }, [courseContent, lectureIdParam, courseId, router]);

  // Get current lecture
  const currentLectureData = React.useMemo(() => {
    if (!courseContent || lectureIdParam === "0") return null;
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

  // Progress update mutation with debouncing
  const progressMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(
        ["courseContent", courseId],
        (old: typeof courseContent) => {
          if (!old) return old;

          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              lectures: section.lectures.map((lecture) =>
                lecture.lectureId === data.lectureId
                  ? {
                      ...lecture,
                      isCompleted: data.isCompleted,
                      watchTime: data.watchTime,
                      lastPosition: data.lastPosition,
                    }
                  : lecture
              ),
            })),
          };
        }
      );

      // Show congratulations if course is completed
      if (data.courseCompleted && !showCongratulations) {
        setShowCongratulations(true);
        setCertificateGenerated(data.certificateGenerated);
      }
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err);
      // eslint-disable-next-line no-console
      console.error("Failed to update progress:", errorMessage);
    },
  });

  // Debounced progress update
  const pendingProgressRef = React.useRef<UpdateProgressRequest | null>(null);
  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const debouncedProgressUpdate = React.useCallback(
    (payload: UpdateProgressRequest) => {
      pendingProgressRef.current = payload;

      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }

      progressTimerRef.current = setTimeout(() => {
        if (pendingProgressRef.current) {
          progressMutation.mutate(pendingProgressRef.current);
          pendingProgressRef.current = null;
        }
      }, 2000); // 2 second debounce
    },
    [progressMutation]
  );

  // Handle video progress update
  const handleProgressUpdate = React.useCallback(
    (currentTime: number, duration: number) => {
      if (!courseContent || !currentLecture) return;

      const isNearEnd = duration - currentTime < 5; // Within 5 seconds of end
      const isCompleted = currentLecture.isCompleted || isNearEnd;

      debouncedProgressUpdate({
        enrollment_id: courseContent.enrollmentId,
        lecture_id: currentLecture.lectureId,
        is_completed: isCompleted,
        watch_time: Math.floor(currentTime),
        last_position: Math.floor(currentTime),
      });
    },
    [courseContent, currentLecture, debouncedProgressUpdate]
  );

  // Handle video end
  const handleVideoEnd = React.useCallback(() => {
    if (!courseContent || !currentLecture) return;

    progressMutation.mutate({
      enrollment_id: courseContent.enrollmentId,
      lecture_id: currentLecture.lectureId,
      is_completed: true,
      watch_time: currentLecture.duration,
      last_position: currentLecture.duration,
    });

    // Auto-navigate to next lecture
    if (nextLecture) {
      setTimeout(() => {
        router.push(`/learn/${courseId}/${nextLecture.lectureId}`);
      }, 1500);
    }
  }, [
    courseContent,
    currentLecture,
    nextLecture,
    courseId,
    router,
    progressMutation,
  ]);

  // Handle complete button
  const handleComplete = React.useCallback(() => {
    if (!courseContent || !currentLecture) return;

    progressMutation.mutate({
      enrollment_id: courseContent.enrollmentId,
      lecture_id: currentLecture.lectureId,
      is_completed: true,
      watch_time: currentLecture.watchTime,
      last_position: currentLecture.lastPosition,
    });
  }, [courseContent, currentLecture, progressMutation]);

  // Navigation handlers
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
    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
      // Send final progress update
      if (pendingProgressRef.current) {
        progressMutation.mutate(pendingProgressRef.current);
      }
    };
  }, [progressMutation]);

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

  const loading = isLoading || lectureIdParam === "0" || videoAssetLoading;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <LectureHeader
        lectureName={currentLecture?.title || ""}
        onComplete={handleComplete}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={!!previousLecture}
        canGoNext={!!nextLecture}
        isCompleted={currentLecture?.isCompleted || false}
        isCompletingLecture={progressMutation.isPending}
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
            <VideoPlayer
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
            <AlertDialogDescription className="space-y-2">
              <p>
                You have successfully completed the course:{" "}
                <strong>{courseContent?.title}</strong>
              </p>
              {certificateGenerated && (
                <p className="text-success-600 font-medium">
                  Your certificate has been generated and is available in your
                  certificates section.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
