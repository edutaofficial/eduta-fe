"use client";

import * as React from "react";
import Image from "next/image";
import {
  EditIcon,
  TrashIcon,
  StarIcon,
  UsersIcon,
  EyeIcon,
  MoreVerticalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface InstructorCourseCardProps {
  course: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    rating: number;
    ratingCount: number;
    enrollments: number;
    impressions: number;
    featured?: boolean;
    status?: string;
    price: number;
  };
}

export function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  return (
    <div className="relative rounded-md bg-white shadow-sm overflow-hidden">
      <div className="relative aspect-[3/2] w-full bg-default-100">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">{course.subtitle}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "size-4",
                  i < Math.floor(course.rating)
                    ? "fill-warning-400 text-warning-400"
                    : "text-default-300"
                )}
              />
            ))}
            <span className="text-sm font-medium text-foreground ml-1">
              {course.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({course.ratingCount.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <UsersIcon className="size-4" />
            <span className="text-xs font-medium">{course.enrollments}+</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-sm font-semibold">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <EyeIcon className="size-4" />
            <span className="text-xs font-medium">{course.impressions}+</span>
          </div>
        </div>
      </div>

      {/* Three dot menu */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="size-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-default-50 transition-colors">
              <MoreVerticalIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <EditIcon className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <TrashIcon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
