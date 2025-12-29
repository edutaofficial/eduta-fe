/**
 * Asset API Module
 * 
 * Provides functions for:
 * - Uploading files using 3-step presigned URL flow
 * - Retrieving asset information
 * - Deleting assets
 */

// Upload functions
export {
  requestUploadUrl,
  uploadToS3,
  confirmUpload,
  uploadAssetComplete,
  type RequestUploadUrlParams,
  type RequestUploadUrlResponse,
  type ConfirmUploadParams,
} from "./uploadAsset";

// Asset retrieval and management
export {
  getAssetById,
  getAssetsByIds,
  deleteAsset,
  type AssetResponse,
} from "./getAsset";

