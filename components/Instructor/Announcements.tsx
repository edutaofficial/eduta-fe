"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CONSTANTS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InstructorAnnouncements() {
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [heading, setHeading] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission
    // TODO: Implement announcement submission
    const formData = { selectedCourses, heading, description };
    return formData;
  };

  const allCourses = CONSTANTS.INSTRUCTOR_PUBLISHED_COURSES;

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAll = () => {
    setSelectedCourses(allCourses.map((c) => c.id));
  };

  const clearAll = () => {
    setSelectedCourses([]);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Announcements</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage course announcements
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
          <CardDescription>
            Select courses and provide announcement details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Courses</label>
              <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                    >
                      Clear All
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedCourses.length} selected
                  </span>
                </div>
                {allCourses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={course.id}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                    />
                    <label
                      htmlFor={course.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {course.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="heading" className="text-sm font-medium">
                Announcement Heading
              </label>
              <Input
                id="heading"
                placeholder="Enter heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Enter announcement description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Announcement
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
