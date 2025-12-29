"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourseContent,
} from "@/app/api/learner/getCourseContent";
import {
  updateProgress,
  type UpdateProgressRequest,
} from "@/app/api/learner/updateProgress";
import {
  createLectureQuestion,
  getLectureQuestions,
  type LectureQuestion,
} from "@/app/api/learner/lectureQuestions";
import { useUpload } from "@/hooks/useUpload";
import { extractErrorMessage } from "@/lib/errorUtils";
import { createLectureUrl } from "@/lib/slugify";
import {
  findLectureById,
  findAdjacentLecture,
  findFirstIncompleteLecture,
  generateNotesStorageKey,
  generateCongratsShownKey,
} from "@/lib/lectureUtils";
import {
  LectureHeader,
  LectureSidebar,
  VideoJSHlsPlayer,
  LearningToolsBar,
  LearningToolsDrawer,
  ProgressToast,
  CourseCompletionDialogs,
  type ToolTab,
} from "@/components/Learn";

interface LecturePlayerClientProps {
  courseId: string;
  lectureId: string;
  initialCourseContent?: Awaited<ReturnType<typeof getCourseContent>>;
}

export function LecturePlayerClient({
  courseId,
  lectureId: lectureIdParam,
  initialCourseContent,
}: LecturePlayerClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useGetAssetById } = useUpload();

  // State management
  const [showCongratulations, setShowCongratulations] = React.useState(false);
  const [certificateGenerated, setCertificateGenerated] = React.useState(false);
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [pendingCourseCompletion, setPendingCourseCompletion] = React.useState<{
    certificateGenerated: boolean;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [progressToast, setProgressToast] = React.useState<string | null>(null);
  const [currentVideoPosition, setCurrentVideoPosition] = React.useState<number>(0);
  const [isToolsOpen, setIsToolsOpen] = React.useState(false);
  const [activeToolTab, setActiveToolTab] = React.useState<ToolTab | null>(null);
  const [drawerPosition, setDrawerPosition] = React.useState({ x: 16, y: 120 });
  const [drawerSize, setDrawerSize] = React.useState({ width: 320, height: 520 });
  const [questionContent, setQuestionContent] = React.useState("");
  const [qaError, setQaError] = React.useState<string | null>(null);
  const [notesValue, setNotesValue] = React.useState("");
  const [notesStatus, setNotesStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  // Refs
  const congratsShownKeyRef = React.useRef(generateCongratsShownKey(courseId));
  const hasShownCongratsRef = React.useRef(false);
  const isMountedRef = React.useRef(true);
  const progressErrorCountRef = React.useRef(0);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentVideoPositionRef = React.useRef<number>(0);
  const pendingProgressRef = React.useRef<UpdateProgressRequest | null>(null);
  const progressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const notesSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const dragStateRef = React.useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const resizeStateRef = React.useRef({
    resizing: false,
    startX: 0,
    startY: 0,
    origW: 0,
    origH: 0,
  });

  // Check if congratulations already shown
  React.useEffect(() => {
    const shownKey = congratsShownKeyRef.current;
    try {
      const alreadyShown = localStorage.getItem(shownKey) === "true";
      hasShownCongratsRef.current = alreadyShown;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("localStorage not available:", e);
    }
  }, []);

  // Validate required params
  React.useEffect(() => {
    if (!courseId || !lectureIdParam) {
      setError("Invalid lecture URL. Missing course or lecture ID.");
    }
  }, [courseId, lectureIdParam]);

  // Fetch course content
  const {
    data: courseContent,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["courseContent", courseId],
    queryFn: () => getCourseContent(courseId),
    initialData: initialCourseContent,
    enabled: !!courseId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Redirect to first incomplete lecture if needed
  React.useEffect(() => {
    if (
      courseContent &&
      (lectureIdParam === "0" || lectureIdParam === "lectures")
    ) {
      const firstIncompleteLecture = findFirstIncompleteLecture(
        courseContent.sections
      );
      if (firstIncompleteLecture) {
        const newUrl = createLectureUrl(
          courseContent.title,
          courseId,
          firstIncompleteLecture.title,
          firstIncompleteLecture.lectureId
        );
        router.replace(newUrl);
      }
    }
  }, [courseContent, lectureIdParam, courseId, router]);

  // Get current lecture
  const currentLectureData = React.useMemo(() => {
    if (
      !courseContent ||
      !lectureIdParam ||
      lectureIdParam === "0" ||
      lectureIdParam === "lectures"
    )
      return null;
    return findLectureById(courseContent.sections, lectureIdParam);
  }, [courseContent, lectureIdParam]);

  const currentLecture = currentLectureData?.lecture;

  // Notes storage
  const notesStorageKey = React.useMemo(() => {
    if (!courseId || !lectureIdParam || lectureIdParam === "0") return "";
    return generateNotesStorageKey(courseId, lectureIdParam);
  }, [courseId, lectureIdParam]);

  // Load saved notes
  React.useEffect(() => {
    if (!notesStorageKey) {
      setNotesValue("");
      return;
    }
    try {
      const saved = localStorage.getItem(notesStorageKey);
      setNotesValue(saved || "");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Unable to load notes from localStorage:", e);
    }
  }, [notesStorageKey]);

  // Persist notes with debounce
  React.useEffect(() => {
    if (!notesStorageKey) return;

    setNotesStatus("saving");
    if (notesSaveTimerRef.current) {
      clearTimeout(notesSaveTimerRef.current);
    }

    notesSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(notesStorageKey, notesValue);
        setNotesStatus("saved");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Unable to save notes to localStorage:", e);
        setNotesStatus("idle");
      }
    }, 500);
  }, [notesValue, notesStorageKey]);

  // Q&A queries
  const {
    data: lectureQuestions = [],
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuery<LectureQuestion[]>({
    queryKey: ["lectureQuestions", lectureIdParam],
    queryFn: () => getLectureQuestions(lectureIdParam),
    enabled:
      !!lectureIdParam &&
      lectureIdParam !== "0" &&
      lectureIdParam !== "lectures",
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (questionsError) {
      setQaError(extractErrorMessage(questionsError));
    }
  }, [questionsError]);

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

  // Complete lecture mutation
  const completeLectureMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      if (
        data.courseCompleted &&
        !showCongratulations &&
        !hasShownCongratsRef.current &&
        !showReviewDialog
      ) {
        setPendingCourseCompletion({
          certificateGenerated: data.certificateGenerated,
        });
        setShowReviewDialog(true);
        try {
          localStorage.setItem(congratsShownKeyRef.current, "true");
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Failed to save to localStorage:", e);
        }
        hasShownCongratsRef.current = true;
      }

      queryClient.invalidateQueries({
        queryKey: ["courseContent", courseId],
        refetchType: "active",
      });

      if (nextLecture && courseContent) {
        setTimeout(() => {
          if (isMountedRef.current) {
            const newUrl = createLectureUrl(
              courseContent.title,
              courseId,
              nextLecture.title,
              nextLecture.lectureId
            );
            router.push(newUrl);
          }
        }, 500);
      }
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err);
      // eslint-disable-next-line no-console
      console.error("❌ Failed to mark lecture as complete:", errorMessage);
    },
  });

  // Progress update mutation
  const progressMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data) => {
      progressErrorCountRef.current = 0;

      if (
        data.courseCompleted &&
        !showCongratulations &&
        !hasShownCongratsRef.current &&
        !showReviewDialog
      ) {
        setPendingCourseCompletion({
          certificateGenerated: data.certificateGenerated,
        });
        setShowReviewDialog(true);
        try {
          localStorage.setItem(congratsShownKeyRef.current, "true");
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Failed to save to localStorage:", e);
        }
        hasShownCongratsRef.current = true;
      }

      if (data.isCompleted) {
        queryClient.invalidateQueries({
          queryKey: ["courseContent", courseId],
          refetchType: "active",
        });
      }
    },
    onError: (err: unknown) => {
      const errorMessage = extractErrorMessage(err);
      progressErrorCountRef.current += 1;

      // eslint-disable-next-line no-console
      console.warn(
        `⚠️ Progress tracking failed (${progressErrorCountRef.current}x):`,
        errorMessage
      );

      if (progressErrorCountRef.current >= 3) {
        if (isMountedRef.current) {
          setProgressToast(
            "Your progress cannot be saved at the moment. The lecture will continue, but your progress may not sync. Please check your connection."
          );

          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }

          toastTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setProgressToast(null);
            }
          }, 10000);
        }
        progressErrorCountRef.current = 0;
      }
    },
    retry: false,
    retryDelay: 0,
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: createLectureQuestion,
    onSuccess: () => {
      setQuestionContent("");
      setQaError(null);
      queryClient.invalidateQueries({
        queryKey: ["lectureQuestions", lectureIdParam],
        refetchType: "active",
      });
    },
    onError: (err: unknown) => {
      setQaError(extractErrorMessage(err));
    },
  });

  // Debounced progress update
  const debouncedProgressUpdate = React.useCallback(
    (payload: UpdateProgressRequest) => {
      if (!isMountedRef.current) return;

      pendingProgressRef.current = payload;

      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }

      progressTimerRef.current = setTimeout(() => {
        if (pendingProgressRef.current && isMountedRef.current) {
          progressMutation.mutate(pendingProgressRef.current);
          pendingProgressRef.current = null;
        }
      }, 2000);
    },
    [progressMutation]
  );

  // Handle video progress update
  const handleProgressUpdate = React.useCallback(
    (currentTime: number, _duration: number) => {
      currentVideoPositionRef.current = currentTime;
      setCurrentVideoPosition(currentTime);

      const { enrollmentId } = courseContent || {};
      const { lectureId, isCompleted } = currentLecture || {};

      if (!courseContent || !currentLecture || !enrollmentId || !lectureId) {
        return;
      }

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

  // Handle video end
  const handleVideoEndRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    handleVideoEndRef.current = () => {
      if (!courseContent || !currentLecture) return;
      if (progressMutation.isPending) return;

      progressMutation.mutate({
        enrollment_id: courseContent.enrollmentId,
        lecture_id: currentLecture.lectureId,
        is_completed: true,
        watch_time: currentLecture.duration || 0,
        last_position: currentLecture.duration || 0,
      });

      if (nextLecture) {
        setTimeout(() => {
          if (isMountedRef.current) {
            const newUrl = createLectureUrl(
              courseContent.title,
              courseId,
              nextLecture.title,
              nextLecture.lectureId
            );
            router.push(newUrl);
          }
        }, 1500);
      }
    };
  }, [courseContent, currentLecture, nextLecture, courseId, router, progressMutation]);

  const handleVideoEnd = React.useCallback(() => {
    handleVideoEndRef.current?.();
  }, []);

  // Handle complete button
  const handleComplete = React.useCallback(() => {
    if (!courseContent || !currentLecture) return;
    if (completeLectureMutation.isPending) return;

    const currentPosition = Math.floor(currentVideoPositionRef.current);

    completeLectureMutation.mutate({
      enrollment_id: courseContent.enrollmentId,
      lecture_id: currentLecture.lectureId,
      is_completed: true,
      watch_time: Math.max(currentPosition, currentLecture.watchTime || 0),
      last_position: currentPosition,
    });
  }, [courseContent, currentLecture, completeLectureMutation]);

  // Handle question submit
  const handleQuestionSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!courseContent || !currentLecture) {
        setQaError("Unable to post question. Please reload and try again.");
        return;
      }
      if (!questionContent.trim()) {
        setQaError("Please enter your question before submitting.");
        return;
      }

      createQuestionMutation.mutate({
        lectureId: currentLecture.lectureId,
        courseId: courseContent.courseId,
        content: questionContent.trim(),
      });
    },
    [courseContent, currentLecture, createQuestionMutation, questionContent]
  );

  // Navigation handlers
  const handleBack = () => router.push("/student/courses");

  const handlePrevious = () => {
    if (previousLecture && courseContent) {
      const newUrl = createLectureUrl(
        courseContent.title,
        courseId,
        previousLecture.title,
        previousLecture.lectureId
      );
      router.push(newUrl);
    }
  };

  const handleNext = () => {
    if (nextLecture && courseContent) {
      const newUrl = createLectureUrl(
        courseContent.title,
        courseId,
        nextLecture.title,
        nextLecture.lectureId
      );
      router.push(newUrl);
    }
  };

  const handleLectureClick = (lectureId: string, lectureTitle: string) => {
    if (courseContent) {
      const newUrl = createLectureUrl(
        courseContent.title,
        courseId,
        lectureTitle,
        lectureId
      );
      router.push(newUrl);
    }
  };

  // Drag & resize handlers
  const handleDragStart = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragStateRef.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: drawerPosition.x,
        origY: drawerPosition.y,
      };
    },
    [drawerPosition.x, drawerPosition.y]
  );

  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      resizeStateRef.current = {
        resizing: true,
        startX: e.clientX,
        startY: e.clientY,
        origW: drawerSize.width,
        origH: drawerSize.height,
      };
    },
    [drawerSize.height, drawerSize.width]
  );

  React.useEffect(() => {
    function onMouseMove(ev: MouseEvent) {
      if (dragStateRef.current.dragging) {
        const dx = ev.clientX - dragStateRef.current.startX;
        const dy = ev.clientY - dragStateRef.current.startY;
        setDrawerPosition({
          x: Math.max(8, dragStateRef.current.origX + dx),
          y: Math.max(80, dragStateRef.current.origY + dy),
        });
      } else if (resizeStateRef.current.resizing) {
        const dx = ev.clientX - resizeStateRef.current.startX;
        const dy = ev.clientY - resizeStateRef.current.startY;
        setDrawerSize({
          width: Math.min(
            Math.max(260, resizeStateRef.current.origW + dx),
            window.innerWidth - 40
          ),
          height: Math.min(
            Math.max(320, resizeStateRef.current.origH + dy),
            window.innerHeight - 160
          ),
        });
      }
    }

    function onMouseUp() {
      dragStateRef.current.dragging = false;
      resizeStateRef.current.resizing = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      if (notesSaveTimerRef.current) clearTimeout(notesSaveTimerRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
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

  // Get video asset
  const { data: videoAsset, isLoading: videoAssetLoading } = useGetAssetById(
    currentLecture?.videoId || 0
  );

  const videoUrl = React.useMemo(() => {
    if (!videoAsset) return "";
    return videoAsset.presigned_url || videoAsset.file_url;
  }, [videoAsset]);

  // Error state
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
    <div className="min-h-screen flex flex-col relative">
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Progress Toast */}
        {progressToast && (
          <ProgressToast
            message={progressToast}
            onDismiss={() => {
              setProgressToast(null);
              if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
              }
            }}
          />
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
        <div className="flex-1 flex flex-col overflow-hidden">
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
            {courseContent && lectureIdParam && (
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
        </div>

        {/* Learning Tools Bar */}
        <LearningToolsBar
          activeTab={activeToolTab}
          onTabChange={(tab) => {
            setActiveToolTab(tab);
            setIsToolsOpen(true);
          }}
        />

        {/* Learning Tools Drawer */}
        <LearningToolsDrawer
          open={isToolsOpen}
          activeTab={activeToolTab}
          onClose={() => {
            setIsToolsOpen(false);
            setActiveToolTab(null);
          }}
          onTabChange={(tab) => {
            setActiveToolTab(tab);
            setIsToolsOpen(true);
          }}
          currentLecture={currentLecture}
          questionsLoading={questionsLoading}
          lectureQuestions={lectureQuestions}
          qaError={qaError}
          questionContent={questionContent}
          onQuestionContentChange={setQuestionContent}
          onRefreshQuestions={() =>
            queryClient.invalidateQueries({
              queryKey: ["lectureQuestions", lectureIdParam],
              refetchType: "active",
            })
          }
          onSubmitQuestion={handleQuestionSubmit}
          notesValue={notesValue}
          onNotesChange={setNotesValue}
          notesStatus={notesStatus}
          position={drawerPosition}
          size={drawerSize}
          onDragStart={handleDragStart}
          onResizeStart={handleResizeStart}
        />

        {/* Course Completion Dialogs */}
        {courseContent && courseContent.enrollmentId && (
          <CourseCompletionDialogs
            showReviewDialog={showReviewDialog}
            onReviewDialogChange={setShowReviewDialog}
            showCongratulations={showCongratulations}
            onCongratulationsChange={setShowCongratulations}
            courseId={courseId}
            courseTitle={courseContent.title}
            enrollmentId={courseContent.enrollmentId}
            certificateGenerated={certificateGenerated}
            onReviewSuccess={() => {
              setShowReviewDialog(false);
              if (pendingCourseCompletion) {
                setShowCongratulations(true);
                setCertificateGenerated(
                  pendingCourseCompletion.certificateGenerated
                );
                setPendingCourseCompletion(null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

