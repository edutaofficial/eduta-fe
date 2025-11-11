"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseDetail } from "@/app/api/course/getCourseDetail";
import { enrollCourse } from "@/app/api/learner/enroll";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "@/app/api/learner/wishlist";
import { getCourseReviews } from "@/app/api/learner/reviews";
import { CourseDetailSkeleton } from "@/components/skeleton/CourseDetailSkeleton";
import { CourseDetail } from "@/components/Common/CourseDetail";
import { RatingDialog } from "@/components/Student/RatingDialog";
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
  const courseId = params.courseId as string;

  const [showInstructorDialog, setShowInstructorDialog] = React.useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = React.useState(false);
  const [showAlreadyEnrolledDialog, setShowAlreadyEnrolledDialog] =
    React.useState(false);
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [welcomeMessage, setWelcomeMessage] = React.useState("");
  const [showRatingDialog, setShowRatingDialog] = React.useState(false);

  // Fetch course detail
  const { data: course, isLoading } = useQuery({
    queryKey: ["courseDetail", courseId],
    queryFn: () => getCourseDetail(courseId),
    enabled: !!courseId,
  });

  // Fetch wishlist to check if course is wishlisted
  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: !!user && user.role !== "instructor",
  });

  const isWishlisted = React.useMemo(() => {
    return (
      wishlistData?.items.some((item) => item.courseId === courseId) || false
    );
  }, [wishlistData, courseId]);

  // Fetch course reviews
  const { data: reviewsData } = useQuery({
    queryKey: ["courseReviews", courseId],
    queryFn: () => getCourseReviews(courseId, { page: 1, page_size: 10 }),
    enabled: !!courseId,
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      // Refresh course detail to get updated enrollment status
      queryClient.invalidateQueries({ queryKey: ["courseDetail", courseId] });
      // Show welcome message from API response
      if (course?.welcomeMessage) {
        setWelcomeMessage(course.welcomeMessage);
        setShowWelcomeDialog(true);
      } else {
        // If no welcome message, just redirect
        router.push(`/learn/${courseId}/lectures`);
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
    if (user?.role === "instructor") {
      setShowInstructorDialog(true);
      return;
    }
    enrollMutation.mutate(courseId);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeWishlistMutation.mutate(courseId);
    } else {
      addWishlistMutation.mutate(courseId);
    }
  };

  const handleWelcomeDialogClose = () => {
    setShowWelcomeDialog(false);
    router.push(`/learn/${courseId}/lectures`);
  };

  const handleGoToLectures = () => {
    setShowAlreadyEnrolledDialog(false);
    router.push(`/learn/${courseId}/lectures`);
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
    queryClient.invalidateQueries({ queryKey: ["courseReviews", courseId] });
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
            className="prose prose-lg max-w-none py-4"
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
          courseId={courseId}
          courseTitle={course.title}
          enrollmentId={course.enrollmentId}
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
}
