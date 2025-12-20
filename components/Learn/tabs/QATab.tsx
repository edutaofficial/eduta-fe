"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LectureQuestion } from "@/app/api/learner/lectureQuestions";

interface QATabProps {
  questions: LectureQuestion[];
  loading: boolean;
  error: string | null;
  questionContent: string;
  onQuestionContentChange: (value: string) => void;
  onRefresh: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function QATab({
  questions,
  loading,
  error,
  questionContent,
  onQuestionContentChange,
  onRefresh,
  onSubmit,
}: QATabProps) {
  return (
    <div className="space-y-4">
      {/* Ask Question Form */}
      <div className="rounded-xl border border-default-200 bg-default-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-default-900">
              Ask a question
            </p>
            <p className="text-xs text-default-500">
              Instructors and peers can reply here.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <Textarea
            placeholder="What would you like to ask?"
            value={questionContent}
            onChange={(e) => onQuestionContentChange(e.target.value)}
            className="min-h-[96px]"
          />
          {error && <p className="text-xs text-warning-600">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit">Post question</Button>
          </div>
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-default-900">
          Recent questions
        </p>
        {loading ? (
          <p className="text-sm text-default-500">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-sm text-default-500">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          <div className="grid gap-3">
            {questions.map((question) => (
              <div
                key={question.questionId}
                className="rounded-lg border border-default-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-default-900">
                    {question.content}
                  </p>
                  <span className="text-xs text-default-500">
                    {new Date(question.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 rounded-md bg-default-50 p-2">
                  <p className="text-xs font-semibold text-default-700">
                    Answer
                  </p>
                  <p className="text-sm text-default-700">
                    {question.answer ? question.answer : "Not answered yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

