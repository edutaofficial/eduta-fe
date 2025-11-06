"use client";
import * as React from "react";
import Image from "next/image";
import { StarIcon, UsersIcon, EyeIcon, BookOpenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export interface CourseCardProps {
  image: string;
  title: string;
  company: string;
  rating: number; // e.g., 4.5
  ratingCount: number; // e.g., 1233
  enrollments: number; // e.g., 120
  impressions: number; // e.g., 340
  featured?: boolean;
  price?: number; // 0 => Free
  className?: string;
}

export function CourseCard({
  image,
  title,
  company,
  rating,
  ratingCount,
  enrollments,
  impressions,
  featured,
  price = 0,
  className,
}: CourseCardProps) {
  const hasImage =
    image && image.trim() !== "" && image !== "undefined" && image !== "null";
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn("rounded-md bg-white shadow-sm overflow-hidden", className)}
    >
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
        <div className="absolute top-4 right-4 bg-white rounded-md">
          {featured ? (
            <Badge variant="secondary">Featured</Badge>
          ) : (
            <Badge>Course</Badge>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{company}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "size-4",
                  i < 5
                    ? "fill-warning-300 text-warning-300"
                    : "text-muted-foreground"
                )}
              />
            ))}
            <span className="text-sm font-medium text-foreground ml-1">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({ratingCount.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <UsersIcon className="size-4" />
            <span className="text-xs font-medium">{enrollments}+</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-sm font-semibold">
              {price === 0 ? "Free" : `$${price}`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <EyeIcon className="size-4" />
            <span className="text-xs font-medium">{impressions}+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
