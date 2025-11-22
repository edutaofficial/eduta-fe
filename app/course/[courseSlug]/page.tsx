"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
  DialogFooter,
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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const courseSlug = params.courseSlug as string;

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
  });

  // Fetch wishlist to check if course is wishlisted
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: !!user && user.role !== "instructor",
  });

  const isWishlisted = React.useMemo(() => {
    return (
      wishlistData?.items.some((item) => item.courseId === course?.courseId) || false
    );
  }, [wishlistData, course?.courseId]);

  // Fetch course reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["courseReviews", course?.courseId],
    queryFn: () => getCourseReviews(course?.courseId || "", { page: 1, page_size: 10 }),
    enabled: !!course?.courseId,
  });

  // Increment view count mutation
  const incrementViewMutation = useMutation({
    mutationFn: incrementCourseView,
    onSuccess: (data) => {
      // eslint-disable-next-line no-console
      console.log(`Course view incremented. Total views: ${data.viewsCount}`);
    },
    onError: (error: Error) => {
      // Silently fail - view tracking is not critical
      // eslint-disable-next-line no-console
      console.warn("Failed to increment view count:", error.message);
    },
  });

  // Increment view count when landing on the page
  React.useEffect(() => {
    if (course?.courseId) {
      incrementViewMutation.mutate(course.courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.courseId]);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      // Refresh course detail to get updated enrollment status
      queryClient.invalidateQueries({ queryKey: ["courseDetail", courseSlug] });
      // Show welcome message from API response
      if (course?.welcomeMessage) {
        setWelcomeMessage(course.welcomeMessage);
        setShowWelcomeDialog(true);
      } else {
        // If no welcome message, just redirect
        router.push(`/learn/${course?.courseId}/lectures`);
      }
    },
    onError: (error: Error) => {
      // Check if user is already enrolled
      if (error.message.toLowerCase().includes("already enrolled")) {
        setShowAlreadyEnrolledDialog(true);
      } else {
        // Show error dialog for any other errors
        setErrorMessage(
          error.message || "Failed to enroll in course. Please try again."
        );
        setShowErrorDialog(true);
      }
    },
  });

  // Wishlist mutations
  const addWishlistMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeWishlistMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleEnroll = () => {
    // Check if user is logged in
    if (!user) {
      setLoginDialogConfig({
        title: "Sign in to enroll",
        description: "Please sign in to enroll in this course",
        action: "enroll",
      });
      setShowLoginDialog(true);
      return;
    }

    if (user.role === "instructor") {
      setShowInstructorDialog(true);
      return;
    }

    if (course?.courseId) {
      enrollMutation.mutate(course.courseId);
    }
  };

  const handleWishlistToggle = () => {
    // Check if user is logged in
    if (!user) {
      setLoginDialogConfig({
        title: "Sign in to add to wishlist",
        description: "Please sign in to add courses to your wishlist",
        action: "wishlist",
      });
      setShowLoginDialog(true);
      return;
    }

    if (course?.courseId) {
      if (isWishlisted) {
        removeWishlistMutation.mutate(course.courseId);
      } else {
        addWishlistMutation.mutate(course.courseId);
      }
    }
  };

  // Handle actions after successful login
  const handleLoginSuccess = React.useCallback(async () => {
    // Wait a bit for session to update
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get the updated session to check user role
    const session = await getSession();
    const userRole = (session as unknown as { role?: string })?.role;

    // Refresh course data to check enrollment status
    await queryClient.invalidateQueries({ queryKey: ["courseDetail", courseSlug] });
    await queryClient.invalidateQueries({ queryKey: ["wishlist"] });

    // Get updated course data
    const updatedCourse = queryClient.getQueryData<typeof course>([
      "courseDetail",
      courseSlug,
    ]);

    if (loginDialogConfig.action === "enroll") {
      // CRITICAL: Check if logged-in user is an instructor
      if (userRole === "instructor") {
        setShowInstructorDialog(true);
      } else if (updatedCourse?.isEnrolled) {
        // Check if already enrolled
        setShowAlreadyEnrolledDialog(true);
      } else if (course?.courseId) {
        // Not enrolled, trigger enrollment
        enrollMutation.mutate(course.courseId);
      }
    } else if (loginDialogConfig.action === "wishlist") {
      // Add to wishlist (instructors can also wishlist)
      if (course?.courseId) {
        addWishlistMutation.mutate(course.courseId);
      }
    }

    // Reset action
    setLoginDialogConfig({ title: "", description: "", action: null });
  }, [
    loginDialogConfig.action,
    course?.courseId,
    courseSlug,
    queryClient,
    enrollMutation,
    addWishlistMutation,
  ]);

  const handleWelcomeDialogClose = () => {
    setShowWelcomeDialog(false);
    router.push(`/learn/${course?.courseId}/lectures`);
  };

  const handleGoToLectures = () => {
    setShowAlreadyEnrolledDialog(false);
    router.push(`/learn/${course?.courseId}/lectures`);
  };

  const handleOpenRatingDialog = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "instructor") {
      setShowInstructorDialog(true);
      return;
    }
    if (!course?.isEnrolled) {
      setErrorMessage(
        "You need to enroll in this course before you can write a review."
      );
      setShowErrorDialog(true);
      return;
    }
    setShowRatingDialog(true);
  };

  const handleRatingSuccess = () => {
    // Refresh reviews after submitting a rating
    queryClient.invalidateQueries({ queryKey: ["courseReviews", course?.courseId] });
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Button onClick={() => router.push("/all-courses")} className="mt-4">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CourseDetail
        courseData={course}
        isWishlisted={isWishlisted}
        onEnroll={handleEnroll}
        onWishlistToggle={handleWishlistToggle}
        enrolling={enrollMutation.isPending}
        wishlistLoading={
          addWishlistMutation.isPending || removeWishlistMutation.isPending
        }
        reviews={reviewsData?.reviews || []}
        averageRating={reviewsData?.averageRating}
        totalReviews={reviewsData?.totalReviews}
        onWriteReview={handleOpenRatingDialog}
      />

      {/* Instructor Dialog */}
      <AlertDialog
        open={showInstructorDialog}
        onOpenChange={setShowInstructorDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Instructor Account</AlertDialogTitle>
            <AlertDialogDescription>
              You need to create a student account to enroll in courses.
              Instructors cannot enroll in courses with their instructor
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInstructorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Welcome Dialog */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Welcome to the Course! 🎉
            </DialogTitle>
          </DialogHeader>
          <div
            className="course-description py-4"
            dangerouslySetInnerHTML={{ __html: welcomeMessage }}
          />
          <DialogFooter>
            <Button
              onClick={handleWelcomeDialogClose}
              className="w-full sm:w-auto bg-primary-400 hover:bg-primary-500"
              size="lg"
            >
              Go to Lectures →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Already Enrolled Dialog */}
      <AlertDialog
        open={showAlreadyEnrolledDialog}
        onOpenChange={setShowAlreadyEnrolledDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already Enrolled</AlertDialogTitle>
            <AlertDialogDescription>
              You are already enrolled in this course. Continue your learning
              journey!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGoToLectures}
              className="bg-primary-400 hover:bg-primary-500"
            >
              Go to Lectures →
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {errorMessage.toLowerCase().includes("enroll")
                ? "Not Enrolled"
                : "Enrollment Failed"}
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog */}
      {course?.isEnrolled && course?.enrollmentId && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          courseId={course.courseId}
          courseTitle={course.title}
          enrollmentId={course.enrollmentId}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title={loginDialogConfig.title}
        description={loginDialogConfig.description}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
