"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { StarIcon, UsersIcon, BookOpenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCompactNumber } from "@/lib/utils";

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

// InfoBadge component for consistent stat badges
function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-0.5 px-2 border border-default-400">
      <span className="text-xs text-default-600 font-normal">
        {children}
      </span>
    </div>
  );
}

export interface CourseCardProps {
  slug: string; // Course slug for routing - MANDATORY
  image: string | null;
  title: string;
  company: string;
  rating: number | null; // e.g., 4.5 (can be null if no ratings yet)
  ratingCount: number; // e.g., 1233
  enrollments: number; // e.g., 120
  totalLectures?: number; // Total number of lectures
  totalDuration?: number | string; // Total duration in minutes OR formatted string (e.g., "5h 30m")
  learningLevel?: string; // e.g., "Beginner", "Intermediate", "Advanced"
  impressions?: number; // e.g., 340 (deprecated - no longer displayed)
  featured?: boolean;
  price?: number; // 0 => Free
  originalPrice?: number; // Original price before discount
  discountPercentage?: number; // Discount percentage
  className?: string;
}

export function CourseCard({
  slug,
  image,
  title,
  company,
  rating,
  ratingCount,
  enrollments,
  totalLectures,
  totalDuration,
  learningLevel,
  featured,
  price = 0,
  originalPrice,
  className,
}: CourseCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const discountPercentage = 100;
  
  // Format duration from minutes OR use pre-formatted string
  const formatDuration = (duration?: number | string): string => {
    if (!duration) return "0 Min";
    
    // If already a formatted string (from API), use it with proper capitalization
    if (typeof duration === "string") {
      // Parse formats like "5h 30m" or "45m" or "0m"
      if (duration === "0m") return "0 Min";
      
      // Convert short format to full text format
      const hourMatch = duration.match(/(\d+)h/);
      const minMatch = duration.match(/(\d+)m/);
      
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const mins = minMatch ? parseInt(minMatch[1]) : 0;
      
      if (hours > 0 && mins > 0) {
        return `${hours} Total hour${hours === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
      } else if (hours > 0) {
        return `${hours} Total hour${hours === 1 ? "" : "s"}`;
      } else if (mins > 0) {
        return `${mins} Total min${mins === 1 ? "" : "s"}`;
      }
      return duration; // Fallback to original string
    }
    
    // Handle numeric minutes
    if (duration < 60) {
      return `${duration} Total min${duration === 1 ? "" : "s"}`;
    }
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (mins > 0) {
      return `${hours} Total hour${hours === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
    }
    return `${hours} Total hour${hours === 1 ? "" : "s"}`;
  };
  return (
    <Link
      href={`/course/${slug}`}
      className={cn(
        "flex flex-col rounded-md h-full w-full bg-white shadow-sm overflow-hidden transition-transform hover:scale-[1.02]",
        className
      )}
    >
      <div className="relative aspect-3/2 w-full bg-default-100">
        {image && !imageError ? (
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
        <div className="absolute top-4 right-4 rounded-md">
          {featured ? (
            <Badge variant="secondary">Featured</Badge>
          ) : (
            <Badge>Course</Badge>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{company}</p>
        </div>

        <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(rating || 0)
                    ? "fill-warning-300 text-warning-300"
                    : "text-muted-foreground"
                )}
              />
            ))}
            <span className="text-sm font-medium text-foreground ml-1">
              {rating ? rating.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({ratingCount.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <UsersIcon className="size-4" />
            <span className="text-xs font-medium">
              {formatCompactNumber(enrollments)}+
            </span>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Total Lectures */}
          {totalLectures && totalLectures > 0 && (
            <InfoBadge>
              {totalLectures} Lecture{totalLectures === 1 ? "" : "s"}
            </InfoBadge>
          )}
          
          {/* Total Students */}
          <InfoBadge>
            {enrollments} Student{enrollments === 1 ? "" : "s"}
          </InfoBadge>
          
          {/* Total Duration */}
          {totalDuration && (
            <InfoBadge>
              {formatDuration(totalDuration)}
            </InfoBadge>
          )}
          
          {/* Total Reviews */}
          {ratingCount > 0 && (
            <InfoBadge>
              {ratingCount} Review{ratingCount === 1 ? "" : "s"}
            </InfoBadge>
          )}
          
          {/* Learning Level */}
          {learningLevel && (
            <InfoBadge>
              {learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1).toLowerCase()}
            </InfoBadge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(() => {
            // Determine if course is free (price is 0 OR 100% discount)
            const isFree = price === 0 || (discountPercentage && discountPercentage >= 100);
            const displayPrice = isFree ? 0 : (price ?? 0);
            
            // Show original price if there's any discount
            const showOriginal = price !== 0;
            const originalPriceToShow = originalPrice ?? price ?? 0;

            return (
              <>
                <span className="text-lg font-bold text-foreground">
                  {displayPrice === 0 ? "Free" : `$${(displayPrice ?? 0).toFixed(2)}`}
                </span>
                {showOriginal && originalPriceToShow != null && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${(originalPriceToShow ?? 0).toFixed(2)}
                  </span>
                )}
                {showOriginal && (
                  <span className="text-xs font-semibold text-primary-600">
                    {Math.round(discountPercentage)}% off
                  </span>
                )}
              </>
            );
          })()}
        </div>
        </div>
      </div>
    </Link>
  );
}
