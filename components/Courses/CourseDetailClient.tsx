"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import { getCourseDetail } from "@/app/api/course/getCourseDetail";
import { enrollCourse } from "@/app/api/learner/enroll";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/app/api/learner/wishlist";
import { getCourseReviews } from "@/app/api/learner/reviews";
import { incrementCourseView } from "@/app/api/courses/incrementView";
import { CourseDetailSkeleton } from "@/components/skeleton/CourseDetailSkeleton";
import { CourseDetail } from "@/components/Common/CourseDetail";
import { RatingDialog } from "@/components/Student/RatingDialog";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { createLectureUrl } from "@/lib/slugify";

export function CourseDetailClient({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showInstructorDialog, setShowInstructorDialog] = React.useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = React.useState(false);
  const [showAlreadyEnrolledDialog, setShowAlreadyEnrolledDialog] =
    React.useState(false);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [welcomeMessage, setWelcomeMessage] = React.useState("");
  const [showRatingDialog, setShowRatingDialog] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [loginDialogConfig, setLoginDialogConfig] = React.useState<{
    title: string;
    description: string;
    action: "enroll" | "wishlist" | null;
  }>({
    title: "",
    description: "",
    action: null,
  });

  // Fetch course detail
  const { data: course, isLoading } = useQuery({
    queryKey: ["courseDetail", courseSlug],
    queryFn: () => getCourseDetail(courseSlug),
    enabled: !!courseSlug,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch wishlist to check if course is wishlisted
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: !!user && user.role !== "instructor",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const isWishlisted = React.useMemo(() => {
    return (
      wishlistData?.items.some((item) => item.courseId === course?.courseId) || false
    );
  }, [wishlistData, course?.courseId]);

  // Fetch course reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["courseReviews", course?.courseId],
    queryFn: () => {
      if (!course?.courseId) throw new Error("Course ID is required");
      return getCourseReviews(course.courseId);
    },
    enabled: !!course?.courseId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating ?? course?.stats.avgRating ?? 0;
  const totalReviews = reviewsData?.totalReviews ?? course?.stats.totalReviews ?? 0;

  // Increment course view on mount
  React.useEffect(() => {
    if (course?.courseId) {
      incrementCourseView(course.courseId).catch(() => {
        // Silently handle error - view increment is not critical
      });
    }
  }, [course?.courseId]);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const session = await getSession();
      if (!session) {
        setLoginDialogConfig({
          title: "Login Required",
          description: "Please login to enroll in this course.",
          action: "enroll",
        });
        setShowLoginDialog(true);
        throw new Error("Not authenticated");
      }
      if (!course?.courseId) throw new Error("Course ID is required");
      return enrollCourse(course.courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseDetail", courseSlug] });
      setWelcomeMessage("Successfully enrolled!");
      setShowWelcomeDialog(true);
    },
    onError: (error: unknown) => {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to enroll in course";
      setErrorMessage(errorMsg);
      setShowErrorDialog(true);
    },
  });

  // Wishlist mutations
  const addToWishlistMutation = useMutation({
    mutationFn: () => {
      if (!course?.courseId) throw new Error("Course ID is required");
      return addToWishlist(course.courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => {
      if (!course?.courseId) throw new Error("Course ID is required");
      return removeFromWishlist(course.courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleEnroll = () => {
    if (!user) {
      setLoginDialogConfig({
        title: "Login Required",
        description: "Please login to enroll in this course.",
        action: "enroll",
      });
      setShowLoginDialog(true);
      return;
    }
    
    // Check if user is an instructor
    if (user.role === "instructor") {
      setErrorMessage("Instructors cannot enroll in courses. Please create a student account to enroll.");
      setShowErrorDialog(true);
      return;
    }
    
    enrollMutation.mutate();
  };

  const handleWishlistToggle = () => {
    if (!user) {
      setLoginDialogConfig({
        title: "Login Required",
        description: "Please login to add courses to your wishlist.",
        action: "wishlist",
      });
      setShowLoginDialog(true);
      return;
    }

    if (isWishlisted) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-default-600 mb-6">
          The course you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button onClick={() => router.push("/topics")}>Browse Courses</Button>
      </div>
    );
  }

  return (
    <>
      <CourseDetail
        courseId={course.courseId}
        courseData={course}
        isWishlisted={isWishlisted}
        onEnroll={handleEnroll}
        onWishlistToggle={handleWishlistToggle}
        enrolling={enrollMutation.isPending}
        wishlistLoading={
          addToWishlistMutation.isPending || removeFromWishlistMutation.isPending
        }
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
        onWriteReview={() => setShowRatingDialog(true)}
      />

      {/* Instructor Dialog */}
      <Dialog open={showInstructorDialog} onOpenChange={setShowInstructorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instructor Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-default-700">
              <strong>Name:</strong> {course.instructor.name}
            </p>
            {course.instructor.professionalTitle && (
              <p className="text-default-700">
                <strong>Title:</strong> {course.instructor.professionalTitle}
              </p>
            )}
            {course.instructor.bio && (
              <p className="text-default-700">
                <strong>Bio:</strong> {course.instructor.bio}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Dialog */}
      <AlertDialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to the Course!</AlertDialogTitle>
            <AlertDialogDescription>{welcomeMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowWelcomeDialog(false);
                const firstLecture = course.sections[0]?.lectures[0];
                if (firstLecture) {
                  const url = createLectureUrl(
                    course.title,
                    course.courseId,
                    firstLecture.title,
                    firstLecture.lectureId
                  );
                  router.push(url);
                }
              }}
            >
              Start Learning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Already Enrolled Dialog */}
      <AlertDialog
        open={showAlreadyEnrolledDialog}
        onOpenChange={setShowAlreadyEnrolledDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Enrolled</AlertDialogTitle>
            <AlertDialogDescription>
              You are already enrolled in this course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowAlreadyEnrolledDialog(false);
                const firstLecture = course.sections[0]?.lectures[0];
                if (firstLecture) {
                  const url = createLectureUrl(
                    course.title,
                    course.courseId,
                    firstLecture.title,
                    firstLecture.lectureId
                  );
                  router.push(url);
                }
              }}
            >
              Continue Learning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog */}
      {showRatingDialog && course.isEnrolled && course.enrollmentId && (
        <RatingDialog
          courseId={course.courseId}
          courseTitle={course.title}
          enrollmentId={course.enrollmentId}
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["courseReviews", course.courseId] });
            setShowRatingDialog(false);
          }}
        />
      )}

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title={loginDialogConfig.title}
        description={loginDialogConfig.description}
      />
    </>
  );
}

