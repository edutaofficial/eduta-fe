"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAskedQuestions, type AskedQuestion } from "@/app/api/learner/getAskedQuestions";
import { extractErrorMessage } from "@/lib/errorUtils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GroupedQuestions = Record<
  string,
  Record<string, AskedQuestion[]>
>;

function groupQuestions(questions: AskedQuestion[]): GroupedQuestions {
  const grouped: GroupedQuestions = {};
  questions.forEach((q) => {
    if (!grouped[q.courseId]) grouped[q.courseId] = {};
    if (!grouped[q.courseId][q.lectureId]) grouped[q.courseId][q.lectureId] = [];
    grouped[q.courseId][q.lectureId].push(q);
  });
  return grouped;
}

export function AskedQuestions() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["askedQuestions"],
    queryFn: getAskedQuestions,
    staleTime: 1000 * 60,
  });

  const filtered = React.useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((q) => {
      return (
        (q.courseTitle ?? "").toLowerCase().includes(term) ||
        (q.lectureTitle ?? "").toLowerCase().includes(term) ||
        q.content.toLowerCase().includes(term) ||
        (q.answer ?? "").toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const grouped = React.useMemo(() => groupQuestions(filtered), [filtered]);

  const hasData = filtered.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-default-900">Asked Questions</h2>
          <p className="text-sm text-default-500">
            Review what you asked across courses. Filter by course, lecture, or keyword.
          </p>
        </div>
        <Input
          placeholder="Search by course, lecture, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>

      {isLoading && (
        <div className="rounded-lg border border-default-200 bg-white p-6">
          <p className="text-default-500">Loading your questions...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive-200 bg-destructive-50 p-6">
          <p className="text-destructive-700 font-medium">
            {extractErrorMessage(error)}
          </p>
        </div>
      )}

      {!isLoading && !error && !hasData && (
        <div className="rounded-lg border border-default-200 bg-white p-6">
          <p className="text-default-500">No questions found.</p>
        </div>
      )}

      {!isLoading && !error && hasData && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([courseId, lectures]) => (
            <div key={courseId} className="rounded-2xl border border-default-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Course
                </Badge>
                <p className="font-semibold text-default-900 break-all">
                  {lectures[Object.keys(lectures)[0]]?.[0]?.courseTitle || courseId}
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {Object.entries(lectures).map(([lectureId, qs]) => (
                  <div
                    key={lectureId}
                    className="rounded-xl border border-default-100 bg-default-50 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Lecture
                      </Badge>
                      <p className="text-sm font-semibold text-default-900 break-all">
                        {qs[0]?.lectureTitle || lectureId}
                      </p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {qs.map((q) => (
                        <div
                          key={q.questionId}
                          className="rounded-lg border border-default-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-default-900">
                              {q.content}
                            </p>
                            <Badge
                              variant={q.answer ? "default" : "secondary"}
                              className={cn(
                                "text-xs",
                                q.answer ? "bg-success-100 text-success-700" : ""
                              )}
                            >
                              {q.answer ? "Answered" : "Open"}
                            </Badge>
                          </div>
                          <div className="mt-2 rounded-md bg-default-50 p-2">
                            <p className="text-xs font-semibold text-default-700">
                              Answer
                            </p>
                            <p className="text-sm text-default-700">
                              {q.answer ? q.answer : "Not answered yet"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

