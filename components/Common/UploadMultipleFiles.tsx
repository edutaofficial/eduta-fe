"use client";

import * as React from "react";
import { UploadIcon, XIcon, Loader2Icon, FileIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  assetId: number;
  fileName: string;
  fileSize: string;
}

export interface UploadMultipleFilesProps {
  label: string;
  accept: string;
  value?: UploadedFile[]; // Array of uploaded files
  onChange: (files: UploadedFile[]) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  hint?: string;
  maxFiles?: number; // Maximum number of files allowed
}

/**
 * Multi-file upload component with:
 * - Drag and drop functionality
 * - Multiple file selection
 * - Real-time upload progress tracking for each file
 * - Returns array of asset IDs
 */
export function UploadMultipleFiles({
  label,
  accept,
  value = [],
  onChange,
  onUploadStateChange,
  error,
  className,
  disabled = false,
  hint,
  maxFiles = 10,
}: UploadMultipleFilesProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadingFiles, setUploadingFiles] = React.useState<
    Record<string, { progress: number; speed: string | null }>
  >({});
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Track overall uploading state
  const isUploading = Object.keys(uploadingFiles).length > 0;

  // Notify parent of upload state changes
  const prevUploadingRef = React.useRef<boolean>(false);
  const callbackRef = React.useRef(onUploadStateChange);

  React.useEffect(() => {
    callbackRef.current = onUploadStateChange;
  }, [onUploadStateChange]);

  React.useEffect(() => {
    if (prevUploadingRef.current !== isUploading) {
      prevUploadingRef.current = isUploading;
      callbackRef.current?.(isUploading);
    }
  }, [isUploading]);

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  // Helper to format upload speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      handleMultipleFileSelect(fileArray);
    }
  };

  const handleMultipleFileSelect = async (files: File[]) => {
    // Check max files limit
    if (value.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const acceptedTypes = accept.split(",").map((type) => type.trim());

    const validFiles = files.filter((file) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      return acceptedTypes.some((acceptType) => {
        if (acceptType.includes("*")) {
          const baseType = acceptType.split("/")[0];
          return fileType.startsWith(baseType);
        }
        return (
          fileType === acceptType ||
          fileName.endsWith(acceptType.replace(".", ""))
        );
      });
    });

    if (validFiles.length !== files.length) {
      setUploadError(`Some files have invalid type. Accepted: ${accept}`);
    }

    if (validFiles.length === 0) return;

    setUploadError(null);

    // Upload each file
    const uploadPromises = validFiles.map((file) => uploadFile(file));

    try {
      const results = await Promise.all(uploadPromises);
      const uploadedFiles = results.filter((result): result is UploadedFile =>
        Boolean(result)
      );

      if (uploadedFiles.length > 0) {
        onChange([...value, ...uploadedFiles]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Upload error:", error);
    }
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const fileKey = `${file.name}-${file.size}`;
    const uploadStartTime = Date.now();

    setUploadingFiles((prev) => ({
      ...prev,
      [fileKey]: { progress: 0, speed: null },
    }));

    try {
      // Import axios instance (default export)
      const axiosInstanceModule = await import("@/app/api/axiosInstance");
      const axiosInstance = axiosInstanceModule.default;

      // Step 1: Request presigned upload URL
      const requestResponse = await axiosInstance.post<{
        asset_id: number;
        upload_url: string;
        file_path: string;
        expires_in: number;
        download_url: string;
      }>("/api/v1/assets/upload/request", {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      });

      const { asset_id, upload_url } = requestResponse.data;

      if (!asset_id || !upload_url) {
        throw new Error("Invalid response: missing asset_id or upload_url");
      }

      // Step 2: Upload file directly to S3 using presigned URL with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round(
              (event.loaded * 100) / event.total
            );

            const elapsedTime = (Date.now() - uploadStartTime) / 1000;
            const speed = elapsedTime > 0 ? event.loaded / elapsedTime : 0;

            setUploadingFiles((prev) => ({
              ...prev,
              [fileKey]: {
                progress: percentCompleted,
                speed: formatSpeed(speed),
              },
            }));
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed: ${xhr.statusText}`));
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          reject(new Error("Network error during S3 upload"));
        });

        // Handle abort
        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        // Start upload
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Confirm upload (optional but recommended)
      try {
        await axiosInstance.post("/api/v1/assets/upload/confirm", {
          asset_id,
        });
      } catch (confirmError) {
        // eslint-disable-next-line no-console
        console.warn("Upload confirm failed, but file was uploaded:", confirmError);
      }

      // Remove from uploading state
      setUploadingFiles((prev) => {
        const { [fileKey]: _, ...rest } = prev;
        return rest;
      });

      return {
        assetId: asset_id,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Upload error:", error);

      // Remove from uploading state
      setUploadingFiles((prev) => {
        const { [fileKey]: _, ...rest } = prev;
        return rest;
      });

      setUploadError(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      handleMultipleFileSelect(fileArray);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (assetId: number) => {
    if (!isUploading) {
      onChange(value.filter((file) => file.assetId !== assetId));
    }
  };

  const isError = error || uploadError;
  const hasFiles = value.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(disabled && "text-muted-foreground")}>
          {label}
        </Label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (
            (e.key === "Enter" || e.key === " ") &&
            !disabled &&
            !isUploading
          ) {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 bg-white",
          "min-h-[140px] flex flex-col items-center justify-center",
          disabled || isUploading
            ? "cursor-not-allowed opacity-60 bg-muted/50"
            : "cursor-pointer hover:border-primary-400 hover:shadow-md hover:bg-primary-50/30",
          isDragging && !disabled && !isUploading
            ? "border-primary-600 bg-linear-to-b from-primary-50 to-primary-100/50 scale-[1.02] shadow-lg"
            : "",
          isError ? "border-destructive bg-destructive/5" : "border-default-300"
        )}
      >
        {!hasFiles && Object.keys(uploadingFiles).length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-30" />
              <div className="relative p-3 bg-linear-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 shadow-sm">
                <UploadIcon
                  className={cn(
                    "size-7 transition-colors",
                    isError ? "text-destructive" : "text-primary-600"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold text-default-900">
                Drag and drop files here
              </p>
              <p className="text-xs text-muted-foreground">
                or{" "}
                <span className="text-primary-600 font-medium underline">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                {hint || `Upload up to ${maxFiles} files`}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {/* Uploaded Files */}
            {value.map((file) => (
              <div
                key={file.assetId}
                className="flex items-center justify-between w-full gap-4 p-3 bg-white border border-default-200 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0 p-2 bg-success-50 rounded-lg border border-success-200">
                    <FileIcon className="size-4 text-success-600" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-default-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">{file.fileSize}</p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.assetId);
                    }}
                    className="shrink-0 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Remove file"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Uploading Files */}
            {Object.entries(uploadingFiles).map(([fileKey, { progress, speed }]) => (
              <div
                key={fileKey}
                className="flex items-center gap-4 w-full p-3 bg-primary-50/50 border border-primary-200 rounded-lg"
              >
                <Loader2Icon className="size-5 text-primary-600 animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-default-900 truncate">
                    {fileKey.split("-")[0]}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{progress}%</span>
                    {speed && (
                      <>
                        <span>•</span>
                        <span className="text-primary-600">{speed}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            {value.length < maxFiles && Object.keys(uploadingFiles).length === 0 && (
              <button
                type="button"
                onClick={handleClick}
                className="w-full p-3 border-2 border-dashed border-primary-300 rounded-lg text-primary-600 hover:bg-primary-50/50 transition-colors text-sm font-medium"
              >
                + Add More Files ({value.length}/{maxFiles})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {(error || uploadError) && (
        <p className="text-sm text-destructive mt-1">{error || uploadError}</p>
      )}
    </div>
  );
}

