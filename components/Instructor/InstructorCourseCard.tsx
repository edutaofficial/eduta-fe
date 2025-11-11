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
  BookOpenIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";

interface InstructorCourseCardProps {
  course: {
    id: string;
    title: string;
    subtitle: string;
    image: string | null;
    rating: number;
    ratingCount: number;
    enrollments: number;
    impressions: number;
    featured?: boolean;
    status?: string;
    price: number;
  };
  onEdit?: (courseId: string) => void;
  onDelete?: (courseId: string) => void;
}

// Generate a consistent placeholder color based on course ID
function getPlaceholderColor(id?: string): string {
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

  // Use course ID to consistently pick a color, or random if no ID
  if (!id) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function InstructorCourseCard({
  course,
  onEdit,
  onDelete,
}: InstructorCourseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Handle undefined/missing values with defaults
  const rating = course?.rating ?? 0;
  const ratingCount = course?.ratingCount ?? 0;
  const enrollments = course?.enrollments ?? 0;
  const impressions = course?.impressions ?? 0;
  const price = course?.price ?? 0;

  const handleEdit = () => {
    onEdit?.(course.id);
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.(course.id);
  };

  return (
    <div className="relative rounded-md bg-white shadow-sm overflow-hidden">
      <div className="relative aspect-3/2 w-full">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              getPlaceholderColor(course.id)
            )}
          >
            <BookOpenIcon className="size-16 text-white opacity-40" />
          </div>
        )}
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
                  i < Math.floor(rating)
                    ? "fill-warning-400 text-warning-400"
                    : "text-default-300"
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

      {/* Three dot menu */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="size-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-default-50 transition-colors">
              <MoreVerticalIcon className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={handleEdit}>
              <EditIcon className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course &quot;{course.title}&quot; and remove all associated data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
