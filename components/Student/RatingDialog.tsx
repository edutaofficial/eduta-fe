"use client";

import * as React from "react";
import { StarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createReview } from "@/app/api/learner/reviews";
import { extractErrorMessage } from "@/lib/errorUtils";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  onSuccess?: () => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  enrollmentId,
  onSuccess,
}: RatingDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [review, setReview] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    // Validate review is required
    if (!review.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReview({
        course_id: courseId,
        enrollment_id: enrollmentId,
        rating,
        review_text: review.trim(),
        is_published: true,
      });

      // Reset form
      setRating(0);
      setReview("");
      onOpenChange(false);

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Failed to submit rating:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setReview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate this course</DialogTitle>
          <DialogDescription>
            Share your experience with &ldquo;{courseTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <StarIcon
                    className={cn(
                      "size-8",
                      star <= (hoverRating || rating)
                        ? "fill-warning-400 text-warning-400"
                        : "text-default-300"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          {/* Review Textarea */}
          <div className="space-y-2">
            <Label htmlFor="review">
              Your Review <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this course..."
              value={review}
              onChange={(e) => {
                setReview(e.target.value);
                // Clear error when user starts typing
                if (error && e.target.value.trim()) {
                  setError(null);
                }
              }}
              rows={5}
              className="resize-none max-w-[34rem]"
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground">
              {review.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || !review.trim() || isSubmitting}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
