"use client";

import { Button } from "@/components/ui/button";
import { FileText, MessageCircle, StickyNote, Download } from "lucide-react";

export type ToolTab = "description" | "qa" | "notes" | "resources";

interface LearningToolsBarProps {
  activeTab: ToolTab | null;
  onTabChange: (tab: ToolTab) => void;
}

export function LearningToolsBar({
  activeTab,
  onTabChange,
}: LearningToolsBarProps) {
  return (
    <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-default-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-default-200 bg-default-50 px-3 py-1 text-xs font-semibold text-default-700">
          Learning tools
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            variant={activeTab === "description" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("description")}
            className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            title="Description"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Description</span>
          </Button>
          <Button
            variant={activeTab === "qa" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("qa")}
            className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            title="Q&A"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Q&amp;A</span>
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("notes")}
            className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            title="Notes"
          >
            <StickyNote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Notes</span>
          </Button>
          <Button
            variant={activeTab === "resources" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("resources")}
            className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            title="Resources"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Resources</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

