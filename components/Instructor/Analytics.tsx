"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/lib/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstructorAnalytics() {
  const [openMetric, setOpenMetric] = React.useState(false);
  const [openCourse, setOpenCourse] = React.useState(false);
  const [dateRange, setDateRange] = React.useState("6months");

  const [selectedMetric, setSelectedMetric] = React.useState("impressions");
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([
    "all",
  ]);

  const metricOptions = [
    { value: "impressions", label: "Impressions" },
    { value: "enrollments", label: "Enrollments" },
    { value: "ratings", label: "Average Rating" },
  ];

  const courseOptions = [
    { value: "all", label: "All Courses" },
    ...CONSTANTS.INSTRUCTOR_PUBLISHED_COURSES.map((course) => ({
      value: course.id,
      label: course.title,
    })),
  ];

  const chartData =
    CONSTANTS.ANALYTICS_DATA[
      selectedMetric as keyof typeof CONSTANTS.ANALYTICS_DATA
    ];

  const currentMetric = metricOptions.find((m) => m.value === selectedMetric);

  const chartConfig = {
    value: {
      label: currentMetric?.label || selectedMetric,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const toggleCourse = (courseId: string) => {
    if (courseId === "all") {
      setSelectedCourses(["all"]);
    } else {
      setSelectedCourses((prev) => {
        const newSelection = prev.filter((id) => id !== "all");
        if (newSelection.includes(courseId)) {
          const updated = newSelection.filter((id) => id !== courseId);
          return updated.length === 0 ? ["all"] : updated;
        } else {
          return [...newSelection, courseId];
        }
      });
    }
  };

  const getSelectedCoursesLabel = () => {
    if (selectedCourses.includes("all")) return "All Courses";
    if (selectedCourses.length === 0) return "All Courses";
    if (selectedCourses.length === 1) {
      const course = courseOptions.find((c) => c.value === selectedCourses[0]);
      return course?.label || "Select";
    }
    return `${selectedCourses.length} courses selected`;
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your course performance and student engagement
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Metric Selector */}
        <Popover open={openMetric} onOpenChange={setOpenMetric}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openMetric}
              className="w-[200px] justify-between"
            >
              {currentMetric?.label || "Select metric..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search metrics..." />
              <CommandList>
                <CommandEmpty>No metric found.</CommandEmpty>
                <CommandGroup>
                  {metricOptions.map((metric) => (
                    <CommandItem
                      key={metric.value}
                      value={metric.value}
                      onSelect={() => {
                        setSelectedMetric(metric.value);
                        setOpenMetric(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedMetric === metric.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {metric.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Course Multi-Select */}
        <Popover open={openCourse} onOpenChange={setOpenCourse}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCourse}
              className="w-[250px] justify-between"
            >
              {getSelectedCoursesLabel()}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search courses..." />
              <CommandList>
                <CommandEmpty>No course found.</CommandEmpty>
                <CommandGroup>
                  {courseOptions.map((course) => (
                    <CommandItem
                      key={course.value}
                      value={course.label}
                      onSelect={() => toggleCourse(course.value)}
                    >
                      <Checkbox
                        checked={selectedCourses.includes(course.value)}
                        className="mr-2"
                      />
                      <span className="flex-1">{course.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {dateRange === "1month" && "Last Month"}
              {dateRange === "3months" && "Last 3 Months"}
              {dateRange === "6months" && "Last 6 Months"}
              {dateRange === "1year" && "Last Year"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {[
                    { value: "1month", label: "Last Month" },
                    { value: "3months", label: "Last 3 Months" },
                    { value: "6months", label: "Last 6 Months" },
                    { value: "1year", label: "Last Year" },
                  ].map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => setDateRange(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          dateRange === option.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Impressions</p>
              <p className="text-2xl font-bold mt-2">12,000</p>
            </div>
            <Badge variant="secondary">+24%</Badge>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold mt-2">1,250</p>
            </div>
            <Badge variant="secondary">+18%</Badge>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold mt-2">4.8</p>
            </div>
            <Badge variant="secondary">★★★★★</Badge>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {currentMetric?.label} Over Time
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing data for the last 6 months
          </p>
        </div>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-1))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
