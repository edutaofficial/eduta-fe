import axiosInstance from "../axiosInstance";

/**
 * Asset Upload API Functions
 * 
 * Implements 3-step presigned URL upload flow:
 * 1. Request presigned URL
 * 2. Upload file to S3
 * 3. Confirm upload (optional)
 */

// Request body for requesting upload URL
export interface RequestUploadUrlParams {
  file_name: string;
  file_type: string;
  file_size?: number;
}

// Response from upload URL request
export interface RequestUploadUrlResponse {
  asset_id: number;
  upload_url: string;
  file_path: string;
  expires_in: number;
  download_url: string;
}

// Confirm upload request
export interface ConfirmUploadParams {
  asset_id: number;
}

/**
 * Step 1: Request presigned upload URL
 * 
 * @param params - File metadata (name, type, size)
 * @returns Presigned URL and asset information
 * 
 * @example
 * ```typescript
 * const { asset_id, upload_url } = await requestUploadUrl({
 *   file_name: "video.mp4",
 *   file_type: "video/mp4",
 *   file_size: 104857600
 * });
 * ```
 */
export async function requestUploadUrl(
  params: RequestUploadUrlParams
): Promise<RequestUploadUrlResponse> {
  try {
    const { data } = await axiosInstance.post<RequestUploadUrlResponse>(
      "/api/v1/assets/upload/request",
      params
    );

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error requesting upload URL:", error);
    throw error;
  }
}

/**
 * Step 2: Upload file to S3 using presigned URL
 * 
 * CRITICAL: Must use PUT method (not GET!)
 * 
 * @param uploadUrl - Presigned URL from Step 1
 * @param file - File to upload
 * @param onProgress - Optional progress callback (0-100)
 * @param signal - Optional AbortSignal for cancellation
 * 
 * @example
 * ```typescript
 * await uploadToS3(upload_url, file, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * ```
 */
export async function uploadToS3(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round(
            (event.loaded * 100) / event.total
          );
          onProgress(percentCompleted);
        }
      });
    }

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            `S3 upload failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
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

    // Start upload with PUT method (CRITICAL!)
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Step 3: Confirm successful upload (optional but recommended)
 * 
 * @param params - Asset ID to confirm
 * 
 * @example
 * ```typescript
 * await confirmUpload({ asset_id: 123 });
 * ```
 */
export async function confirmUpload(
  params: ConfirmUploadParams
): Promise<void> {
  try {
    await axiosInstance.post("/api/v1/assets/upload/confirm", params);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error confirming upload:", error);
    throw error;
  }
}

/**
 * Complete upload flow - Combines all 3 steps
 * 
 * This is a convenience function that handles the entire upload process:
 * 1. Request presigned URL
 * 2. Upload to S3
 * 3. Confirm upload
 * 
 * @param file - File to upload
 * @param onProgress - Optional progress callback (0-100)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Asset information including ID and download URL
 * 
 * @example
 * ```typescript
 * const asset = await uploadAssetComplete(
 *   file,
 *   (progress) => console.log(`${progress}%`),
 *   abortController.signal
 * );
 * console.log(`Uploaded! Asset ID: ${asset.asset_id}`);
 * ```
 */
export async function uploadAssetComplete(
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<RequestUploadUrlResponse> {
  // Step 1: Request presigned URL
  const uploadData = await requestUploadUrl({
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
  });

  // Step 2: Upload to S3
  await uploadToS3(uploadData.upload_url, file, onProgress, signal);

  // Step 3: Confirm upload (optional, but recommended)
  try {
    await confirmUpload({ asset_id: uploadData.asset_id });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Upload confirm failed, but file was uploaded:", error);
    // Don't throw - file was successfully uploaded even if confirm failed
  }

  return uploadData;
}

