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

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  onSubmit: (rating: number, review: string) => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  courseTitle,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [review, setReview] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating, review);
      // Reset form
      setRating(0);
      setReview("");
      onOpenChange(false);
    } catch (error) {
      // Handle error
      // eslint-disable-next-line no-console
      console.error("Failed to submit rating:", error);
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
            <Label htmlFor="review">Your Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this course..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {review.length}/500 characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

