import * as React from "react";
import Image from "next/image";
import { StarIcon, UsersIcon, EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="relative aspect-[3/2] w-full bg-default-100">
        <Image src={image} alt={title} fill className="object-cover" />
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
            <span className="text-xs font-medium">{enrollments}+ enrolled</span>
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

        <div className="pt-1">
          {featured ? (
            <Badge
              variant="secondary"
              className="border-primary-300 text-primary-700 bg-primary-50"
            >
              Featured
            </Badge>
          ) : (
            <Badge variant="outline">Course</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
