"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../../ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { unifiedSearch, type UnifiedSearchCourse, type UnifiedSearchInstructor } from "@/app/api/course/unifiedSearch";
import { BookOpenIcon, UserIcon } from "lucide-react";

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

export default function SearchComponent({
  alwaysShowResults = false,
}: {
  alwaysShowResults?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [showResults, setShowResults] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [courses, setCourses] = React.useState<UnifiedSearchCourse[]>([]);
  const [instructors, setInstructors] = React.useState<UnifiedSearchInstructor[]>([]);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const shouldShowResults = alwaysShowResults || showResults;

  // Debounced search
  React.useEffect(() => {
    if (!search.trim()) {
      setCourses([]);
      setInstructors([]);
      setIsSearching(false);
      return;
    }

    // Show loading immediately when user starts typing
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await unifiedSearch(search);
        setCourses(results.courses || []);
        setInstructors(results.instructors || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Search error:", error);
        setCourses([]);
        setInstructors([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [search]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
    setShowResults(false);
    setSearch("");
  };

  const handleInstructorClick = (instructorId: number) => {
    // Navigate to instructor profile or courses by instructor
    router.push(`/all-courses?instructor=${instructorId}`);
    setShowResults(false);
    setSearch("");
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const hasResults = courses.length > 0 || instructors.length > 0;
  const showEmpty = !isSearching && search.trim() && !hasResults;

  return (
    <Command 
      className="relative group w-full md:w-[24.375rem] rounded-md overflow-visible"
      shouldFilter={false}
    >
      <CommandInput
        className="h-10"
        placeholder="Search courses and instructors..."
        value={search}
        onValueChange={(value) => setSearch(value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />
      <CommandList
        className={cn(
          "min-h-[15rem] max-h-[28rem] bg-white overflow-y-auto absolute top-10 left-0 w-full border border-default-200 rounded-md shadow-lg z-50",
          shouldShowResults && search.trim() ? "block" : "hidden",
          alwaysShowResults ? "min-h-[20rem] max-h-[none]" : "min-h-[15rem] max-h-[28rem]"
        )}
      >
        {/* Loading State */}
        {isSearching && (
          <>
            <CommandGroup heading="Courses">
              {[...Array(3)].map((_, i) => (
                <CommandItem key={`course-skeleton-${i}`} disabled className="opacity-100">
                  <div className="flex items-center gap-3 w-full py-2">
                    <Skeleton className="rounded-md size-14 flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Instructors">
              {[...Array(3)].map((_, i) => (
                <CommandItem key={`instructor-skeleton-${i}`} disabled className="opacity-100">
                  <div className="flex items-center gap-3 w-full py-2">
                    <Skeleton className="rounded-full size-14 flex-shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Empty State */}
        {showEmpty && <CommandEmpty>No results found.</CommandEmpty>}

        {/* Courses Results */}
        {!isSearching && courses.length > 0 && (
          <CommandGroup heading="Courses">
            {courses.map((course) => {
              const hasImage =
                course.imageUrl &&
                course.imageUrl.trim() !== "" &&
                !imageErrors[course.courseId];

              return (
                <CommandItem
                  key={course.courseId}
                  value={course.courseId}
                  onSelect={() => handleCourseClick(course.courseId)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative size-14 flex-shrink-0 rounded-md overflow-hidden">
                      {hasImage ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(course.courseId)}
                          unoptimized
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center",
                            getPlaceholderColor(course.title)
                          )}
                        >
                          <BookOpenIcon className="size-6 text-white opacity-60" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h3 className="text-default-900 font-medium text-sm line-clamp-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs">
                        <p className="text-default-900 font-medium">Course</p>
                        <Separator
                          orientation="vertical"
                          className="h-3 bg-default-300 min-h-3"
                        />
                        <p className="text-default-600 text-[.625rem]">
                          {course.enrolledCount} enrollment{course.enrolledCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Separator between courses and instructors */}
        {!isSearching && courses.length > 0 && instructors.length > 0 && (
          <CommandSeparator />
        )}

        {/* Instructors Results */}
        {!isSearching && instructors.length > 0 && (
          <CommandGroup heading="Instructors">
            {instructors.map((instructor) => {
              const initials = instructor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <CommandItem
                  key={instructor.instructorId}
                  value={String(instructor.instructorId)}
                  onSelect={() => handleInstructorClick(instructor.instructorId)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="size-14 flex-shrink-0">
                      {instructor.imageUrl && !imageErrors[`instructor-${instructor.instructorId}`] ? (
                        <AvatarImage
                          src={instructor.imageUrl}
                          alt={instructor.name}
                          onError={() => handleImageError(`instructor-${instructor.instructorId}`)}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {initials || <UserIcon className="size-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h3 className="text-default-900 font-medium text-sm">
                        {instructor.name}
                      </h3>
                      <p className="text-default-600 text-[.625rem] line-clamp-1">
                        {instructor.coursesCount} course{instructor.coursesCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
