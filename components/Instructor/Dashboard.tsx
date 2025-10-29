"use client";

import * as React from "react";
import { PlusIcon, EditIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONSTANTS } from "@/lib/constants";
import { InstructorCourseCard } from "./InstructorCourseCard";

export function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const draftCourses = CONSTANTS.INSTRUCTOR_DRAFT_COURSES;
  const allCourses = CONSTANTS.INSTRUCTOR_PUBLISHED_COURSES;

  const filteredCourses = React.useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || course.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus, allCourses]);

  return (
    <div className="p-8 space-y-8">
      {/* Draft Section */}
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Draft</h1>
          <p className="text-muted-foreground mt-2">
            Complete and publish your courses
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {draftCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <UserIcon className="size-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-default-900 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {course.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium text-default-900">
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <Button variant="outline" className="w-full gap-2">
                <EditIcon className="size-4" />
                Continue Editing
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-default-900">Courses</h2>
            <p className="text-muted-foreground mt-1">
              Explore your own courses
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/instructor/courses/create">
              <PlusIcon className="size-4" />
              Add Course
            </Link>
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterStatus === "all"
                  ? "All Status"
                  : filterStatus.charAt(0).toUpperCase() +
                    filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("published")}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <InstructorCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
