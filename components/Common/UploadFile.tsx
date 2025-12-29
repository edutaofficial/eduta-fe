"use client";

import * as React from "react";
import { UploadIcon, XIcon, Loader2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface UploadFileProps {
  label: string;
  accept: string;
  value?: string | number | null; // asset ID (string or number)
  onChange: (assetId: number | null, file?: File) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  hint?: string; // Custom hint text (e.g., "Supports MP4, MOV, AVI")
  required?: boolean; // Show required asterisk
}

/**
 * Comprehensive file upload component with:
 * - Drag and drop functionality
 * - Real-time upload progress tracking
 * - Consistent UI that doesn't jump during state changes
 * - Returns asset ID and upload state
 */
export function UploadFile({
  label,
  accept,
  value,
  onChange,
  onUploadStateChange,
  error,
  className,
  disabled = false,
  hint,
  required = false,
}: UploadFileProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileSize, setFileSize] = React.useState<string | null>(null);
  const [uploadSpeed, setUploadSpeed] = React.useState<string | null>(null);
  const [uploadedBytes, setUploadedBytes] = React.useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadStartTimeRef = React.useRef<number>(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const pendingFileRef = React.useRef<File | null>(null);

  // Track upload state changes (use ref to prevent infinite loops)
  const prevUploadingRef = React.useRef<boolean>(false);
  const callbackRef = React.useRef(onUploadStateChange);

  // Keep callback ref updated without triggering effects
  React.useEffect(() => {
    callbackRef.current = onUploadStateChange;
  }, [onUploadStateChange]);

  React.useEffect(() => {
    // Only call callback if state actually changed
    if (prevUploadingRef.current !== isUploading) {
      prevUploadingRef.current = isUploading;
      callbackRef.current?.(isUploading);
    }
  }, [isUploading]);

  // Reset error when value changes (external update)
  React.useEffect(() => {
    if (value) {
      setUploadError(null);
    }
  }, [value]);

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
    // Only set to false if we're actually leaving the drop zone
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
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

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

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isValidType = acceptedTypes.some((acceptType) => {
      if (acceptType.includes("*")) {
        const baseType = acceptType.split("/")[0];
        return fileType.startsWith(baseType);
      }
      return (
        fileType === acceptType ||
        fileName.endsWith(acceptType.replace(".", ""))
      );
    });

    if (!isValidType) {
      setUploadError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    // Store file for retry
    pendingFileRef.current = file;

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed(null);
    uploadStartTimeRef.current = Date.now();
    setUploadedBytes(0);

    // Create new abort controller for this upload
    abortControllerRef.current = new AbortController();

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
      }>(
        "/api/v1/assets/upload/request",
        {
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

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
            setUploadProgress(percentCompleted);
            setUploadedBytes(event.loaded);

            // Calculate upload speed
            const elapsedTime =
              (Date.now() - uploadStartTimeRef.current) / 1000; // seconds
            if (elapsedTime > 0 && event.loaded > 0) {
              const speed = event.loaded / elapsedTime;
              setUploadSpeed(formatSpeed(speed));
            }
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

        // Connect abort controller to xhr
        if (abortControllerRef.current) {
          abortControllerRef.current.signal.addEventListener("abort", () => {
            xhr.abort();
          });
        }

        // Start upload
        xhr.open("PUT", upload_url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Confirm upload (optional but recommended)
      try {
        await axiosInstance.post(
          "/api/v1/assets/upload/confirm",
          {
            asset_id,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        );
      } catch (confirmError) {
        // eslint-disable-next-line no-console
        console.warn("Upload confirm failed, but file was uploaded:", confirmError);
      }

      // Success!
      onChange(asset_id, file);
      setUploadProgress(100);
      // Clear pending file on success
      pendingFileRef.current = null;
      // Show success animation before clearing
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(null);
        setUploadedBytes(0);
      }, 500);
    } catch (error: unknown) {
      // Check if error was due to cancellation
      if (error && typeof error === "object" && "code" in error && error.code === "ERR_CANCELED") {
        // eslint-disable-next-line no-console
        console.log("Upload cancelled by user");
        setUploadError("Upload cancelled");
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(null);
        setUploadedBytes(0);
        return;
      }

      // Check for abort/cancellation
      if (error instanceof Error && error.message === "Upload cancelled") {
        // eslint-disable-next-line no-console
        console.log("Upload cancelled by user");
        setUploadError("Upload cancelled");
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(null);
        setUploadedBytes(0);
        return;
      }

      // eslint-disable-next-line no-console
      console.error("Upload error:", error);

      // Extract error message with better error handling
      let errorMessage = "Failed to upload file. Please try again.";

      try {
        if (error && typeof error === "object") {
          // Check for Axios error structure
          const axiosError = error as {
            response?: {
              data?: { message?: string; error?: string; detail?: string };
              status?: number;
              statusText?: string;
            };
            message?: string;
            code?: string;
          };

          if (axiosError.response?.data) {
            // Try to get message from response data
            errorMessage =
              axiosError.response.data.message ||
              axiosError.response.data.error ||
              axiosError.response.data.detail ||
              `Upload failed (${axiosError.response.status || "Unknown status"})`;
          } else if (axiosError.message) {
            // Handle specific error messages
            if (axiosError.message.includes("S3 upload failed")) {
              errorMessage = "Failed to upload to storage. Please try again.";
            } else if (axiosError.message.includes("Network error")) {
              errorMessage = "Network error. Please check your internet connection.";
            } else {
              errorMessage = axiosError.message;
            }
          } else if (axiosError.code === "ERR_NETWORK") {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (axiosError.code === "ECONNABORTED") {
            errorMessage = "Upload timeout. The file may be too large.";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error("Error parsing error message:", parseError);
        errorMessage = "An unexpected error occurred during upload.";
      }

      setUploadError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSpeed(null);
      setUploadedBytes(0);
      onChange(null);
      setFileName(null);
      setFileSize(null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = () => {
    if (pendingFileRef.current) {
      handleFileSelect(pendingFileRef.current);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
    // Reset input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading) {
      onChange(null);
      setFileName(null);
      setFileSize(null);
      setUploadError(null);
      setUploadProgress(0);
      setUploadSpeed(null);
      setUploadedBytes(0);
    }
  };

  // Determine display state
  const hasFile = value && value !== "" && value !== 0 && !isUploading;
  const showProgress = isUploading;
  const isError = error || uploadError;

  // Generate hint text based on accept type if not provided
  const displayHint =
    hint ||
    (accept.includes("video")
      ? "Supports MP4, MOV, AVI"
      : accept.includes("image")
        ? "Supports PNG, JPG, WEBP"
        : "Select a file to upload");

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(disabled && "text-muted-foreground")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
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
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-primary-400 hover:shadow-md hover:bg-primary-50/30",
          isDragging && !disabled && !isUploading
            ? "border-primary-600 bg-linear-to-b from-primary-50 to-primary-100/50 scale-[1.02] shadow-lg"
            : "",
          isError
            ? "border-destructive bg-destructive/5"
            : "border-default-300",
          showProgress && "bg-linear-to-b from-primary-50/50 to-white"
        )}
        style={{
          // Ensure consistent height to prevent UI jumps
          height: hasFile || showProgress ? "auto" : "140px",
        }}
      >
        {showProgress ? (
          // Upload Progress State - Enhanced UI with Cancel
          <div className="flex flex-col gap-4 w-full px-2">
            {/* Progress Circle and Status */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {/* Animated spinner background */}
                <div className="absolute inset-0">
                  <Loader2Icon className="size-12 text-primary-200 animate-spin" />
                </div>
                {/* Progress circle */}
                <svg
                  className="size-12 transform -rotate-90"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-primary-100"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - uploadProgress / 100)}`}
                    className="text-primary-600 transition-all duration-300 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-600">
                    {uploadProgress}%
                  </span>
                </div>
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-default-900 truncate">
                  {fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {fileSize && <span>{fileSize}</span>}
                  {uploadSpeed && (
                    <>
                      <span>•</span>
                      <span className="text-primary-600 font-medium">
                        {uploadSpeed}
                      </span>
                    </>
                  )}
                  {uploadProgress === 100 && (
                    <>
                      <span>•</span>
                      <span className="text-success-600 font-medium">
                        Processing...
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Cancel Button */}
              {uploadProgress < 100 && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="w-full bg-linear-to-r from-primary-100 to-primary-50 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-linear-to-r from-primary-500 to-primary-600 h-full transition-all duration-300 ease-out rounded-full shadow-sm"
                  style={{
                    width: `${uploadProgress}%`,
                    boxShadow:
                      uploadProgress > 0
                        ? "0 0 8px rgba(41, 119, 169, 0.5)"
                        : "none",
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-muted-foreground">
                  {uploadProgress < 100
                    ? "Uploading..."
                    : "Finalizing upload..."}
                </span>
                <span className="text-muted-foreground">
                  {uploadedBytes > 0 && fileSize && (
                    <>
                      {formatFileSize(uploadedBytes)} / {fileSize}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : hasFile ? (
          // File Selected State - Enhanced
          <div className="flex items-center justify-between w-full gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Success checkmark animation */}
              <div className="shrink-0 p-2.5 bg-linear-to-br from-success-50 to-success-100 rounded-xl border border-success-200 shadow-sm">
                <svg
                  className="size-5 text-success-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                    className="animate-in draw-in duration-500"
                  />
                </svg>
              </div>
              <div className="text-left flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium text-default-900 truncate">
                  {fileName || "File uploaded successfully"}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  {fileSize && (
                    <span className="text-muted-foreground">{fileSize}</span>
                  )}
                  {fileSize && <span className="text-muted-foreground">•</span>}
                  <span className="text-success-600 font-medium">
                    ✓ Upload complete
                  </span>
                </div>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="shrink-0 p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
                aria-label="Remove file"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        ) : (
          // Empty State - Enhanced
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
                Drag and drop file here
              </p>
              <p className="text-xs text-muted-foreground">
                or{" "}
                <span className="text-primary-600 font-medium underline">
                  click to browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                {displayHint}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display with Retry */}
      {(error || uploadError) && (
        <div className="flex items-center justify-between gap-3 mt-1">
          <p className="text-sm text-destructive flex-1">{error || uploadError}</p>
          {uploadError && pendingFileRef.current && (
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-md transition-colors border border-primary-300"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
