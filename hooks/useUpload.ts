"use client";

import { useMutationQuery, useGetQuery } from "@/hooks/useApi";
import axiosInstance from "@/app/api/axiosInstance";
import type { Asset } from "@/types/course";

// Parameters for upload request
interface UploadRequest {
  file: File;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export function useUpload() {
  // 3-step upload with presigned URL flow
  const uploadAsset = useMutationQuery<UploadRequest, Asset>(
    async ({ file, onProgress, signal }) => {
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
          signal,
        }
      );

      const { asset_id, upload_url, download_url, file_path: _file_path } = requestResponse.data;

      if (!asset_id || !upload_url) {
        throw new Error("Invalid response: missing asset_id or upload_url");
      }

      // Step 2: Upload file directly to S3 using presigned URL with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const percentCompleted = Math.round(
              (event.loaded * 100) / event.total
            );
            onProgress(percentCompleted);
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

        // Connect abort signal to xhr
        if (signal) {
          signal.addEventListener("abort", () => {
            xhr.abort();
          });
        }

        // Start upload with PUT method
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
            signal,
          }
        );
      } catch (confirmError) {
        // eslint-disable-next-line no-console
        console.warn("Upload confirm failed, but file was uploaded:", confirmError);
      }

      // Return asset data in the expected format
      // Extract file extension from file name
      const fileExtension = file.name.split(".").pop() || "";
      
      return {
        asset_id,
        user_id: 0, // Will be set by backend
        file_name: file.name,
        file_type: file.type,
        file_extension: fileExtension,
        file_url: download_url,
        presigned_url: download_url,
      } as Asset;
    }
  );

  const useGetAssetById = (assetId: number) =>
    useGetQuery<Asset>({ 
      queryKey: ["asset", assetId], 
      url: `/api/v1/assets/${assetId}`,
      enabled: assetId > 0, // Only fetch if assetId is valid
      refetchOnWindowFocus: false, // Prevent refetch when switching tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return { 
    uploadAsset,
    useGetAssetById,
  };
}


