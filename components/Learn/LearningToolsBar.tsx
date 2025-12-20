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
    <div className="px-6 py-3 border-t border-default-200 bg-white">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-default-200 bg-default-50 px-3 py-1 text-xs font-semibold text-default-700">
          Learning tools
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeTab === "description" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("description")}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Description
          </Button>
          <Button
            variant={activeTab === "qa" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("qa")}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Q&amp;A
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("notes")}
            className="gap-2"
          >
            <StickyNote className="h-4 w-4" />
            Notes
          </Button>
          <Button
            variant={activeTab === "resources" ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange("resources")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Resources
          </Button>
        </div>
      </div>
    </div>
  );
}

