"use client";

import { Textarea } from "@/components/ui/textarea";

interface NotesTabProps {
  value: string;
  onChange: (value: string) => void;
  status: "idle" | "saving" | "saved";
}

export function NotesTab({ value, onChange, status }: NotesTabProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-800">
        Please copy/paste your notes elsewhere when done. These notes are only
        saved locally for your convenience.
      </div>
      <Textarea
        placeholder="Jot down quick reminders while you watch..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[160px]"
      />
      <div className="flex items-center justify-between text-xs text-default-500">
        <span>
          {status === "saving"
            ? "Saving..."
            : status === "saved"
              ? "Saved locally"
              : ""}
        </span>
        <span>Auto-saves to this device for this lecture only.</span>
      </div>
    </div>
  );
}

