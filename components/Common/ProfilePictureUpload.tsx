"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/useUpload";
import { CameraIcon, UploadIcon, XIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProfilePictureUpload - A professional profile picture upload component
 *
 * Features:
 * - Image preview before upload
 * - Drag & drop support
 * - File validation (type and size)
 * - Multiple size options (sm, md, lg, xl)
 * - Hover to edit/remove
 * - Upload progress indicator
 * - Accessible keyboard navigation
 *
 * @example
 * ```tsx
 * <ProfilePictureUpload
 *   currentImageUrl={user?.avatarUrl}
 *   currentAssetId={user?.profilePictureId}
 *   fallbackText="JD"
 *   onAssetIdChange={(assetId) => setProfilePictureId(assetId)}
 *   size="lg"
 * />
 * ```
 */
export interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  currentAssetId?: number | null;
  fallbackText?: string;
  onAssetIdChange: (assetId: number | null) => void;
  onImageUrlChange?: (url: string | null) => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "size-20",
  md: "size-24",
  lg: "size-32",
  xl: "size-40",
};

const iconSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

export function ProfilePictureUpload({
  currentImageUrl,
  currentAssetId,
  fallbackText = "U",
  onAssetIdChange,
  onImageUrlChange,
  className,
  size = "lg",
}: ProfilePictureUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { uploadAsset } = useUpload();

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): boolean => {
    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or WebP)");
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image size should not exceed 5MB");
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // eslint-disable-next-line no-console
      console.log("ProfilePictureUpload: Uploading image...");
      const result = await uploadAsset.mutateAsync({
        file: selectedFile,
      });
      // eslint-disable-next-line no-console
      console.log(
        "ProfilePictureUpload: Upload successful, full result:",
        result
      );
      // eslint-disable-next-line no-console
      console.log(
        "ProfilePictureUpload: Asset ID (asset_id) raw:",
        result.asset_id,
        typeof result.asset_id
      );

      // Ensure asset_id is a number (backend might return string)
      const assetIdAsNumber =
        typeof result.asset_id === "string"
          ? parseInt(result.asset_id, 10)
          : result.asset_id;

      // Get the image URL (prefer presigned_url for S3, fallback to file_url)
      const imageUrl = result.presigned_url || result.file_url || null;

      // eslint-disable-next-line no-console
      console.log(
        "ProfilePictureUpload: Asset ID converted to number:",
        assetIdAsNumber,
        typeof assetIdAsNumber
      );
      // eslint-disable-next-line no-console
      console.log(
        "ProfilePictureUpload: Image URL:",
        imageUrl
      );

      onAssetIdChange(assetIdAsNumber);
      
      // Update image URL if callback is provided
      if (onImageUrlChange && imageUrl) {
        onImageUrlChange(imageUrl);
      }
      
      // Keep the preview but clear the selected file
      setSelectedFile(null);
      // eslint-disable-next-line no-console
      console.log(
        "ProfilePictureUpload: Asset ID and URL passed to parent"
      );
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      // eslint-disable-next-line no-console
      console.error("ProfilePictureUpload: Upload error:", err);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    onAssetIdChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;
  const isUploading = uploadAsset.isPending;

  // Debug logging
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("🖼️ ProfilePictureUpload: currentImageUrl:", currentImageUrl);
    // eslint-disable-next-line no-console
    console.log("🖼️ ProfilePictureUpload: previewUrl:", previewUrl);
    // eslint-disable-next-line no-console
    console.log("🖼️ ProfilePictureUpload: displayImageUrl:", displayImageUrl);
    // eslint-disable-next-line no-console
    console.log("🖼️ ProfilePictureUpload: currentAssetId:", currentAssetId);
  }, [currentImageUrl, previewUrl, displayImageUrl, currentAssetId]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative group">
        <Avatar
          className={cn(sizeClasses[size], "border-4 border-default-200")}
        >
          {displayImageUrl ? (
            <AvatarImage
              src={displayImageUrl}
              alt="Profile picture"
              className="object-cover"
              onError={(e) => {
                // eslint-disable-next-line no-console
                console.error(
                  "🖼️ ProfilePictureUpload: Image failed to load:",
                  displayImageUrl
                );
                // eslint-disable-next-line no-console
                console.error("🖼️ ProfilePictureUpload: Error event:", e);
              }}
              onLoad={() => {
                // eslint-disable-next-line no-console
                console.log(
                  "🖼️ ProfilePictureUpload: Image loaded successfully:",
                  displayImageUrl
                );
              }}
            />
          ) : null}
          <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl font-semibold">
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        {/* Camera Icon Overlay */}
        <button
          type="button"
          onClick={handleBrowse}
          disabled={isUploading}
          className={cn(
            "absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed",
            sizeClasses[size]
          )}
          aria-label="Change profile picture"
        >
          <CameraIcon className={cn("text-white", iconSizes[size])} />
        </button>

        {/* Remove Button */}
        {displayImageUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
            aria-label="Remove picture"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Drag & Drop Area (only show if no preview) */}
      {!displayImageUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "w-full max-w-sm border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary-500 bg-primary-50"
              : "border-default-300 hover:border-primary-400 hover:bg-default-50"
          )}
          onClick={handleBrowse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleBrowse();
            }
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary-100 rounded-full p-3">
              <CameraIcon className="size-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-default-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, or WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Button (show when file is selected) */}
      {selectedFile && !isUploading && (
        <div className="flex gap-2 w-full max-w-sm">
          <Button
            type="button"
            onClick={handleUpload}
            className="flex-1"
            size="sm"
          >
            <UploadIcon className="size-4 mr-2" />
            Upload Picture
          </Button>
          <Button
            type="button"
            onClick={handleRemove}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {/* Upload Success Message */}
      {!selectedFile && previewUrl && currentAssetId && (
        <p className="text-sm text-success-600">
          Picture uploaded successfully! Don&apos;t forget to save changes.
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive max-w-sm text-center">{error}</p>
      )}

      {/* Helper Text */}
      {displayImageUrl && !selectedFile && !isUploading && (
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          Hover over the picture to change or remove it
        </p>
      )}
    </div>
  );
}
