"use client";

import { useRouter } from "next/navigation";
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
import { RatingDialog } from "@/components/Student/RatingDialog";

interface CourseCompletionDialogsProps {
  showReviewDialog: boolean;
  onReviewDialogChange: (open: boolean) => void;
  showCongratulations: boolean;
  onCongratulationsChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  certificateGenerated: boolean;
  onReviewSuccess: () => void;
}

export function CourseCompletionDialogs({
  showReviewDialog,
  onReviewDialogChange,
  showCongratulations,
  onCongratulationsChange,
  courseId,
  courseTitle,
  enrollmentId,
  certificateGenerated,
  onReviewSuccess,
}: CourseCompletionDialogsProps) {
  const router = useRouter();

  return (
    <>
      {/* Review Dialog - Shown first when course is completed */}
      <RatingDialog
        open={showReviewDialog}
        onOpenChange={(open) => {
          // Prevent closing without submitting - review is required
          if (!open) return;
          onReviewDialogChange(open);
        }}
        courseId={courseId}
        courseTitle={courseTitle}
        enrollmentId={enrollmentId}
        onSuccess={onReviewSuccess}
      />

      {/* Congratulations Dialog - Shown after review */}
      <AlertDialog
        open={showCongratulations}
        onOpenChange={onCongratulationsChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              🎉 Congratulations!
            </AlertDialogTitle>
            <div className="space-y-2">
              <AlertDialogDescription>
                You have successfully completed the course:{" "}
                <strong>{courseTitle}</strong>
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
            <AlertDialogCancel onClick={() => onCongratulationsChange(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCongratulationsChange(false);
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
    </>
  );
}

