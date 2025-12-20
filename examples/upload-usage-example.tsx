/**
 * Upload System Usage Examples
 * 
 * This file demonstrates how to use the updated upload system with the new API endpoint.
 * All examples work with the updated upload components and hooks.
 * The new system uses a single-step upload process with enhanced metadata support.
 */

"use client";

import * as React from "react";
import { useUpload } from "@/hooks/useUpload";
import { UploadFile, UploadMultipleFiles, ProfilePictureUpload } from "@/components/Common";

// ============================================================================
// Example 1: Using UploadFile Component (Recommended)
// ============================================================================
export function Example1_SingleFileUpload() {
  const [videoAssetId, setVideoAssetId] = React.useState<number | null>(null);
  const [_isUploading, setIsUploading] = React.useState(false);

  return (
    <div>
      <UploadFile
        label="Upload Video"
        accept="video/*"
        value={videoAssetId}
        onChange={(assetId) => setVideoAssetId(assetId)}
        onUploadStateChange={(uploading) => setIsUploading(uploading)}
        hint="Supports MP4, MOV, AVI (max 2GB)"
      />
      {videoAssetId && (
        <p>Video uploaded! Asset ID: {videoAssetId}</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Using UploadMultipleFiles Component
// ============================================================================
export function Example2_MultipleFilesUpload() {
  const [uploadedFiles, setUploadedFiles] = React.useState<Array<{
    assetId: number;
    fileName: string;
    fileSize: string;
  }>>([]);

  return (
    <div>
      <UploadMultipleFiles
        label="Upload Resources"
        accept=".pdf,.doc,.docx"
        value={uploadedFiles}
        onChange={(files) => setUploadedFiles(files)}
        maxFiles={5}
        hint="Upload up to 5 PDF or Word documents"
      />
      {uploadedFiles.length > 0 && (
        <div>
          <p>Uploaded {uploadedFiles.length} files:</p>
          <ul>
            {uploadedFiles.map((file) => (
              <li key={file.assetId}>
                {file.fileName} ({file.fileSize})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Using ProfilePictureUpload Component
// ============================================================================
export function Example3_ProfilePictureUpload() {
  const [profilePictureId, setProfilePictureId] = React.useState<number | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = React.useState<string | null>(null);

  return (
    <div>
      <ProfilePictureUpload
        currentImageUrl={profilePictureUrl}
        currentAssetId={profilePictureId}
        fallbackText="JD"
        onAssetIdChange={setProfilePictureId}
        onImageUrlChange={setProfilePictureUrl}
        size="lg"
      />
      {profilePictureId && (
        <p>Profile picture uploaded! Asset ID: {profilePictureId}</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Using the Hook Directly (Advanced)
// ============================================================================
export function Example4_DirectHookUsage() {
  const { uploadAsset } = useUpload();
  const [progress, setProgress] = React.useState(0);
  const [assetId, setAssetId] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const result = await uploadAsset.mutateAsync({
        file,
        onProgress: (percentCompleted) => {
          setProgress(percentCompleted);
        },
        signal: abortControllerRef.current.signal,
      });

      setAssetId(result.asset_id);
      // eslint-disable-next-line no-console
      console.log("Upload complete!", result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Upload failed:", error);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
      />
      
      {uploadAsset.isPending && (
        <div>
          <p>Uploading... {progress}%</p>
          <button onClick={handleCancel}>Cancel Upload</button>
        </div>
      )}

      {assetId && (
        <p>Upload successful! Asset ID: {assetId}</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Handling Errors
// ============================================================================
export function Example5_ErrorHandling() {
  const { uploadAsset } = useUpload();
  const [error, setError] = React.useState<string | null>(null);

  const _handleUpload = async (file: File) => {
    setError(null);
    
    try {
      await uploadAsset.mutateAsync({ file });
    } catch (err) {
      // Error handling - extract meaningful message
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Upload failed. Please try again.";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Upload error:", err);
    }
  };

  return (
    <div>
      {/* Your upload UI */}
      {error && (
        <div className="text-red-500">
          Error: {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Getting Asset Information
// ============================================================================
export function Example6_GetAssetInfo() {
  const { useGetAssetById } = useUpload();
  const [assetId, setAssetId] = React.useState<number>(0);

  // Hook will automatically fetch when assetId > 0
  const { data: asset, isLoading, error } = useGetAssetById(assetId);

  return (
    <div>
      <input
        type="number"
        value={assetId}
        onChange={(e) => setAssetId(parseInt(e.target.value) || 0)}
        placeholder="Enter asset ID"
      />

      {isLoading && <p>Loading asset info...</p>}
      {error && <p>Error loading asset</p>}
      {asset && (
        <div>
          <p>File Name: {asset.file_name}</p>
          <p>File Type: {asset.file_type}</p>
          <p>File URL: {asset.file_url}</p>
          {asset.presigned_url && (
            <p>Presigned URL: {asset.presigned_url}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 7: Upload with Form Submission
// ============================================================================
export function Example7_FormIntegration() {
  const [videoAssetId, setVideoAssetId] = React.useState<number | null>(null);
  const [thumbnailAssetId, setThumbnailAssetId] = React.useState<number | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoAssetId || !thumbnailAssetId) {
      // eslint-disable-next-line no-console
      console.error("Please upload both video and thumbnail");
      return;
    }

    // Submit form with asset IDs
    const formData = {
      title: "My Course",
      videoAssetId,
      thumbnailAssetId,
    };

    // eslint-disable-next-line no-console
    console.log("Submitting:", formData);
    // ... submit to your API
  };

  return (
    <form onSubmit={handleSubmit}>
      <UploadFile
        label="Course Video"
        accept="video/*"
        value={videoAssetId}
        onChange={(assetId) => setVideoAssetId(assetId)}
        onUploadStateChange={setIsUploading}
        required
      />

      <UploadFile
        label="Course Thumbnail"
        accept="image/*"
        value={thumbnailAssetId}
        onChange={(assetId) => setThumbnailAssetId(assetId)}
        required
      />

      <button
        type="submit"
        disabled={isUploading || !videoAssetId || !thumbnailAssetId}
      >
        Create Course
      </button>
    </form>
  );
}

