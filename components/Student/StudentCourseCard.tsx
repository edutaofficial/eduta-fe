"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, BookOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StudentCourseCardProps {
  id: string;
  courseId: string;
  title: string;
  instructor: string;
  image: string;
  progress: number;
  rating: number;
  hasRated: boolean;
  onRate: (id: string) => void;
  className?: string;
}

// Generate a consistent placeholder color based on course title
function getPlaceholderColor(title?: string): string {
  const colors = [
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-yellow-400 to-yellow-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-indigo-400 to-indigo-600",
    "bg-gradient-to-br from-teal-400 to-teal-600",
  ];

  if (!title) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function StudentCourseCard({
  id,
  courseId,
  title,
  instructor,
  image,
  progress,
  rating,
  hasRated,
  onRate,
  className,
}: StudentCourseCardProps) {
  const hasImage =
    image && image.trim() !== "" && image !== "undefined" && image !== "null";
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-lg bg-white shadow-sm overflow-hidden border border-default-200 hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Course Image */}
      <Link href={`/learn/${courseId}/lectures`}>
        <div className="relative aspect-[3/2] w-full bg-default-100">
          {hasImage && !imageError ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={
                image.includes("placehold.co") || image.includes("pravatar")
              }
            />
          ) : (
            <div
              className={cn(
                "w-full h-full flex items-center justify-center",
                getPlaceholderColor(title)
              )}
            >
              <BookOpenIcon className="size-16 text-white opacity-40" />
            </div>
          )}
        </div>
      </Link>

      {/* Course Content */}
      <div className="p-4 space-y-3">
        {/* Title and Instructor */}
        <div className="space-y-1">
          <Link href={`/learn/${courseId}/lectures`}>
            <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary-600 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{instructor}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress}% completed</p>
        </div>

        {/* Rating Section */}
        <div className="flex items-center justify-between pt-2 border-t border-default-200">
          <div className="flex items-center gap-1">
            {hasRated ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      "size-4",
                      i < rating
                        ? "fill-warning-300 text-warning-300"
                        : "text-default-300"
                    )}
                  />
                ))}
              </>
            ) : (
              <>
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="size-4 text-default-300 opacity-50"
                  />
                ))}
              </>
            )}
          </div>
          {!hasRated && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onRate(id)}
              className="text-xs text-primary-600 hover:text-primary-700 p-0 h-auto"
            >
              Leave a rating
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

