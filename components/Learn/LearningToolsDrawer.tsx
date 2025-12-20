"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DescriptionTab } from "./tabs/DescriptionTab";
import { QATab } from "./tabs/QATab";
import { NotesTab } from "./tabs/NotesTab";
import { ResourcesTab } from "./tabs/ResourcesTab";
import type { Lecture } from "@/app/api/learner/getCourseContent";
import type { LectureQuestion } from "@/app/api/learner/lectureQuestions";
import type { ToolTab } from "./LearningToolsBar";

interface LearningToolsDrawerProps {
  open: boolean;
  activeTab: ToolTab | null;
  onClose: () => void;
  onTabChange: (tab: ToolTab) => void;
  currentLecture: Lecture | undefined;
  questionsLoading: boolean;
  lectureQuestions: LectureQuestion[];
  qaError: string | null;
  questionContent: string;
  onQuestionContentChange: (val: string) => void;
  onRefreshQuestions: () => void;
  onSubmitQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  notesValue: string;
  onNotesChange: (val: string) => void;
  notesStatus: "idle" | "saving" | "saved";
  position: { x: number; y: number };
  size: { width: number; height: number };
  onDragStart: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function LearningToolsDrawer({
  open,
  activeTab,
  onClose,
  onTabChange,
  currentLecture,
  questionsLoading,
  lectureQuestions,
  qaError,
  questionContent,
  onQuestionContentChange,
  onRefreshQuestions,
  onSubmitQuestion,
  notesValue,
  onNotesChange,
  notesStatus,
  position,
  size,
  onDragStart,
  onResizeStart,
}: LearningToolsDrawerProps) {
  if (!open) return null;

  const handleKeyActivate = (
    event: React.KeyboardEvent<HTMLDivElement>,
    handler: (e: React.MouseEvent<HTMLDivElement>) => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(event as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  const label =
    activeTab === "description"
      ? "Description"
      : activeTab === "qa"
        ? "Q&A"
        : activeTab === "notes"
          ? "Notes"
          : activeTab === "resources"
            ? "Resources"
            : "Learning tools";

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div
        className="pointer-events-auto absolute overflow-auto rounded-2xl border border-default-200 bg-background shadow-2xl"
        style={{
          width: size.width,
          height: size.height,
          minWidth: 260,
          minHeight: 320,
          top: position.y,
          left: position.x,
        }}
      >
        {/* Draggable Header */}
        <div
          className="flex items-center justify-between gap-2 border-b border-default-200 px-4 py-3 cursor-move select-none"
          onMouseDown={onDragStart}
          role="button"
          tabIndex={0}
          aria-label="Drag learning tools panel"
          onKeyDown={(e) => handleKeyActivate(e, onDragStart)}
        >
          <div>
            <p className="text-sm font-semibold text-default-900">{label}</p>
            <p className="text-xs text-default-500">
              Description, Q&A, notes, and resources
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border text-default-600 transition hover:text-default-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-auto px-4 pb-4 pt-3">
          <Tabs
            value={activeTab || undefined}
            onValueChange={(val) => onTabChange(val as ToolTab)}
            className="flex flex-col gap-3"
          >
            <TabsContent value="description" className="space-y-3">
              <DescriptionTab description={currentLecture?.description} />
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
              <QATab
                questions={lectureQuestions}
                loading={questionsLoading}
                error={qaError}
                questionContent={questionContent}
                onQuestionContentChange={onQuestionContentChange}
                onRefresh={onRefreshQuestions}
                onSubmit={onSubmitQuestion}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-3">
              <NotesTab
                value={notesValue}
                onChange={onNotesChange}
                status={notesStatus}
              />
            </TabsContent>

            <TabsContent value="resources" className="space-y-3">
              <ResourcesTab resources={currentLecture?.resources} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-md bg-default-200"
          onMouseDown={onResizeStart}
          role="button"
          tabIndex={0}
          aria-label="Resize learning tools panel"
          onKeyDown={(e) => handleKeyActivate(e, onResizeStart)}
        />
      </div>
    </div>
  );
}

