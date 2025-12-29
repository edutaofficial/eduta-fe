"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "../Learn/VideoPlayer";
import { PlayIcon, VideoIcon } from "lucide-react";

export interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string | null;
  isLoading?: boolean;
  title: string;
  subtitle: string;
  dialogTitle: string;
  className?: string;
  bottomInfo?: React.ReactNode;
}

export function VideoPreviewModal({
  open,
  onOpenChange,
  videoUrl,
  isLoading = false,
  title,
  subtitle,
  dialogTitle,
  className = "w-[95vw] md:w-[50.5rem]",
  bottomInfo,
}: VideoPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${className} !max-w-full w-[600px] p-0 gap-0 bg-black border-none`}>
        <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>
        {/* Close Button - Always visible */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2.5 transition-all group"
          aria-label="Close video"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header with course info */}
        <div className="bg-gradient-to-b from-black/90 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 rounded-full p-2">
              <PlayIcon className="size-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold line-clamp-1">{title}</h3>
              <p className="text-white/70 text-xs">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Video Container - No overlays blocking controls */}
        <div className="relative w-full aspect-video bg-black">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent" />
              <p className="text-lg font-medium">Loading video preview...</p>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full">
              <VideoPlayer
                videoUrl={videoUrl}
                startPosition={0}
                onProgressUpdate={() => {}}
                onVideoEnd={() => {}}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <VideoIcon className="size-16 text-white/40" />
              <p className="text-lg font-medium">Video not available</p>
              <p className="text-sm text-white/60">
                This preview video could not be loaded
              </p>
            </div>
          )}
        </div>

        {/* Bottom info bar - Doesn't overlay video controls */}
        <div className="bg-gradient-to-t from-black/90 to-transparent px-6 py-3">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <div className="flex items-center gap-4">
              {bottomInfo || (
                <span className="text-white/50 text-xs">Video Preview</span>
              )}
            </div>
            <span className="text-white/50 text-xs">Press ESC to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

