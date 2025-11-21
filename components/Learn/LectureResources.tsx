"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  DownloadIcon,
  FileIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LectureResource } from "@/app/api/learner/getCourseContent";
import axiosInstance from "@/app/api/axiosInstance";
import type { Asset } from "@/types/course";

interface LectureResourcesProps {
  resources: LectureResource[];
  className?: string;
}

/**
 * Lecture Resources Component
 * Displays downloadable resources for a lecture in a collapsible drawer
 */
export function LectureResources({
  resources,
  className,
}: LectureResourcesProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [downloadingIds, setDownloadingIds] = React.useState<Set<number>>(
    new Set()
  );

  // Don't render if no resources
  if (!resources || resources.length === 0) {
    return null;
  }

  const handleDownload = async (resource: LectureResource) => {
    if (downloadingIds.has(resource.assetId)) return;

    setDownloadingIds((prev) => new Set(prev).add(resource.assetId));

    try {
      // Fetch asset details to get download URL
      const { data: asset } = await axiosInstance.get<Asset>(
        `/api/v1/assets/${resource.assetId}`
      );

      // Get download URL (prefer presigned_url, fallback to file_url)
      const downloadUrl = asset.presigned_url || asset.file_url;

      if (!downloadUrl) {
        throw new Error("No download URL available");
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = resource.resourceName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to download resource:", error);
      // Show a user-friendly error message
      // TODO: Implement toast notification when toast hook is available
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(resource.assetId);
        return newSet;
      });
    }
  };

  const getFileIcon = (resourceType: string) => {
    const type = resourceType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc") || type.includes("docx")) return "📝";
    if (type.includes("xls") || type.includes("xlsx")) return "📊";
    if (type.includes("ppt") || type.includes("pptx")) return "📽️";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    if (type.includes("image") || type.includes("jpg") || type.includes("png"))
      return "🖼️";
    return "📎";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-white hover:bg-gray-50 border-gray-200"
        >
          <div className="flex items-center gap-2">
            <FileIcon className="size-4" />
            <span className="font-medium">
              Lecture Resources ({resources.length})
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          {resources
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((resource) => {
              const isDownloading = downloadingIds.has(resource.assetId);
              return (
                <div
                  key={resource.resourceId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">
                      {getFileIcon(resource.resourceType)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {resource.resourceName}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        {resource.resourceType}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(resource)}
                    disabled={isDownloading}
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-2"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="size-4" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

