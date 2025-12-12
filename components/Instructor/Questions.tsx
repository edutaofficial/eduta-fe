"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircleIcon,
  MessageSquareIcon,
  Clock3Icon,
  CheckCircle2Icon,
  FilterIcon,
  SearchIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { getInstructorCourses } from "@/app/api/course/getInstructorCourses";
import {
  answerInstructorCourseQuestion,
  getInstructorCourseQuestions,
  type InstructorCourseQuestion,
} from "@/app/api/instructor/courseQuestions";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

type QuestionFilter = "all" | "answered" | "unanswered";

const filterOptions: { value: QuestionFilter; label: string; description: string }[] = [
  { value: "all", label: "All", description: "Every question for the course" },
  { value: "unanswered", label: "Unanswered", description: "Needs your reply" },
  { value: "answered", label: "Answered", description: "Already handled" },
];

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getStatusBadge(question: InstructorCourseQuestion) {
  const status = question.status?.toLowerCase();
  if (status === "answered" || question.answer) {
    return <Badge className="bg-success-50 text-success-700 border border-success-200">Answered</Badge>;
  }
  if (status === "closed") {
    return (
      <Badge variant="secondary" className="border border-default-300 text-default-700 bg-white">
        Closed
      </Badge>
    );
  }
  return <Badge variant="secondary">Open</Badge>;
}

function isAnswered(question: InstructorCourseQuestion): boolean {
  return question.status === "answered" || !!question.answer;
}

function isUnanswered(question: InstructorCourseQuestion): boolean {
  return !isAnswered(question);
}

export function InstructorQuestions() {
  const { user } = useAuth();
  const instructorId = user?.instructorId;
  const queryClient = useQueryClient();

  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<QuestionFilter>("unanswered");
  const [answerDrafts, setAnswerDrafts] = React.useState<Record<string, string>>({});
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [courseSearch, setCourseSearch] = React.useState("");
  const debouncedCourseSearch = useDebounce(courseSearch, 400);
  const questionsCardRef = React.useRef<HTMLDivElement | null>(null);

  const {
    data: coursesResponse,
    isLoading: loadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: ["instructor", "courses", "questions", instructorId, debouncedCourseSearch],
    queryFn: () => {
      if (!instructorId) throw new Error("Instructor ID not found");
      return getInstructorCourses({
        instructorId,
        status: "published",
        sortBy: "created_at",
        order: "desc",
        pageSize: 50,
        query: debouncedCourseSearch || undefined,
      });
    },
    enabled: !!instructorId,
  });

  const courses = React.useMemo(() => coursesResponse?.data ?? [], [coursesResponse?.data]);

  React.useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].courseId);
      return;
    }
    if (
      selectedCourseId &&
      courses.length > 0 &&
      !courses.some((course) => course.courseId === selectedCourseId)
    ) {
      setSelectedCourseId(courses[0].courseId);
    }
  }, [courses, selectedCourseId]);

  const {
    data: questions = [],
    isLoading: loadingQuestions,
    error: questionsError,
  } = useQuery<InstructorCourseQuestion[]>({
    queryKey: ["instructor", "courseQuestions", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      return getInstructorCourseQuestions(selectedCourseId);
    },
    enabled: !!selectedCourseId,
  });

  const answerMutation = useMutation<
    InstructorCourseQuestion | null,
    Error,
    { questionId: string; answer: string; courseId: string | null }
  >({
    mutationFn: ({
      questionId,
      answer,
    }) => answerInstructorCourseQuestion(questionId, answer),
    onSuccess: (_data, variables) => {
      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: ["instructor", "courseQuestions", variables.courseId],
        });
      }
      setAnswerDrafts((prev) => ({ ...prev, [variables.questionId]: "" }));
      setLocalError(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to submit answer";
      setLocalError(message);
    },
  });

  const filteredQuestions = React.useMemo(() => {
    if (statusFilter === "answered") {
      return questions.filter(isAnswered);
    }
    if (statusFilter === "unanswered") {
      return questions.filter(isUnanswered);
    }
    return questions;
  }, [questions, statusFilter]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswerDrafts((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    const answer = (answerDrafts[questionId] || "").trim();
    if (!answer) {
      setLocalError("Please type an answer before submitting.");
      return;
    }
    setLocalError(null);
    answerMutation.mutate({
      questionId,
      answer,
      courseId: selectedCourseId,
    });
  };

  const totalQuestions = questions.length;
  const totalUnanswered = questions.filter(isUnanswered).length;

  React.useEffect(() => {
    if (!questionsCardRef.current || !selectedCourseId) return;
    questionsCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedCourseId]);

  return (
    <section className="space-y-6" id="questions">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-default-900 flex items-center gap-2">
          <MessageCircleIcon className="size-6 text-primary-600" />
          Student Questions
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Review what students are asking across your courses and respond directly from here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card className="border-default-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="size-5 text-primary-600" />
              Your Courses
            </CardTitle>
            <CardDescription>Select a course to view its questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search courses by title or description..."
                  className="pl-9 h-10 border-default-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            {coursesError && (
              <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-md p-3">
                {(coursesError as Error).message}
              </div>
            )}
            {loadingCourses ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-default-50 border border-dashed border-default-200 rounded-lg p-4">
                No courses found for this instructor yet.
              </div>
            ) : (
              <RadioGroup
                value={selectedCourseId ?? ""}
                onValueChange={(val) => setSelectedCourseId(val)}
                className="max-h-[60vh] overflow-auto pr-1 space-y-2"
              >
                {courses.map((course) => {
                  const isSelected = course.courseId === selectedCourseId;
                  const banner = course.courseBannerUrl || course.courseLogoUrl || "";
                  const radioId = `course-${course.courseId}`;
                  return (
                    <label
                      key={course.courseId}
                      htmlFor={radioId}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-lg border px-3 py-3 transition-all cursor-pointer",
                        "hover:border-primary-200 hover:bg-primary-50/60",
                        isSelected
                          ? "border-primary-300 bg-primary-50 shadow-sm"
                          : "border-default-200 bg-white"
                      )}
                    >
                      <div className="shrink-0 rounded-md overflow-hidden bg-default-100 w-14 h-14">
                        {banner ? (
                          <Image
                            src={banner}
                            alt={`${course.title} banner`}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-linear-to-br from-default-100 to-default-200" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-default-900 line-clamp-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {course.categoryName} • {course.learningLevel}
                        </p>
                      </div>
                      <RadioGroupItem
                        id={radioId}
                        value={course.courseId}
                        className="h-5 w-5 border-2 border-primary-300 data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-50"
                      />
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        <Card className="border-default-200 shadow-sm" ref={questionsCardRef}>
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <FilterIcon className="size-5 text-primary-600" />
                  Questions
                </CardTitle>
                <CardDescription>
                  {selectedCourseId
                    ? "Filter and answer questions for the selected course."
                    : "Choose a course to view its questions."}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <span className="text-default-900 font-semibold">{totalQuestions} total</span>
                <span className="text-muted-foreground">{totalUnanswered} awaiting reply</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "rounded-full",
                    statusFilter === option.value
                      ? "bg-primary-600 text-white"
                      : "border-default-200 text-default-700"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4 max-h-[70vh] overflow-auto pr-1">
            {localError && (
              <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-md p-3">
                {localError}
              </div>
            )}
            {questionsError && (
              <div className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-md p-3">
                {(questionsError as Error).message}
              </div>
            )}

            {!selectedCourseId ? (
              <div className="text-sm text-muted-foreground bg-default-50 border border-dashed border-default-200 rounded-lg p-4">
                Select a course to see its questions.
              </div>
            ) : loadingQuestions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="space-y-2 rounded-lg border border-default-200 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-default-50 border border-dashed border-default-200 rounded-lg p-4">
                No questions found for this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((question) => {
                  const canAnswer = !isAnswered(question) && question.status !== "closed";
                  const isSubmitting = answerMutation.isPending && answerMutation.variables?.questionId === question.questionId;

                  return (
                    <div
                      key={question.questionId}
                      className="rounded-lg border border-default-200 bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-default-900 leading-relaxed">
                            {question.content}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquareIcon className="size-4" />
                              Lecture: {(question.lectureId ?? "").slice(0, 8) || "—"}…
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock3Icon className="size-4" />
                              Asked {formatDate(question.createdAt)}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(question)}
                      </div>

                      {isAnswered(question) ? (
                        <div className="rounded-md border border-success-200 bg-success-50 p-3 space-y-1">
                          <div className="flex items-center gap-2 text-success-700 font-semibold text-sm">
                            <CheckCircle2Icon className="size-4" />
                            Answer
                          </div>
                          <p className="text-sm text-default-900 whitespace-pre-line">
                            {question.answer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Responded on {formatDate(question.answeredAt)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Your answer
                          </label>
                          <Textarea
                            value={answerDrafts[question.questionId] ?? ""}
                            onChange={(event) =>
                              handleAnswerChange(question.questionId, event.target.value)
                            }
                            placeholder="Share a concise, helpful answer for your student..."
                            rows={4}
                            className="resize-none"
                            disabled={!canAnswer || isSubmitting}
                          />
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">
                              The student will be notified after you submit.
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAnswerChange(question.questionId, "")}
                                disabled={isSubmitting}
                              >
                                Clear
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSubmitAnswer(question.questionId)}
                                disabled={!canAnswer || isSubmitting}
                              >
                                {isSubmitting ? "Sending..." : "Submit answer"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

