import axiosInstance from "../axiosInstance";

/**
 * Asset information response from API
 */
export interface AssetResponse {
  asset_id: number;
  user_id: number;
  file_name: string;
  file_type: string;
  file_extension: string;
  file_size?: number;
  file_path?: string;
  file_url: string;
  presigned_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get asset information by ID
 * 
 * @param assetId - Asset ID to fetch
 * @returns Asset information including download URLs
 * 
 * @example
 * ```typescript
 * const asset = await getAssetById(123);
 * console.log(asset.file_url); // Direct download URL
 * console.log(asset.presigned_url); // Presigned URL (if available)
 * ```
 */
export async function getAssetById(assetId: number): Promise<AssetResponse> {
  try {
    const { data } = await axiosInstance.get<AssetResponse>(
      `/api/v1/assets/${assetId}`
    );

    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching asset ${assetId}:`, error);
    throw error;
  }
}

/**
 * Get multiple assets by IDs
 * 
 * @param assetIds - Array of asset IDs to fetch
 * @returns Array of asset information
 * 
 * @example
 * ```typescript
 * const assets = await getAssetsByIds([123, 456, 789]);
 * assets.forEach(asset => console.log(asset.file_name));
 * ```
 */
export async function getAssetsByIds(
  assetIds: number[]
): Promise<AssetResponse[]> {
  try {
    // Fetch all assets in parallel
    const promises = assetIds.map((id) => getAssetById(id));
    const assets = await Promise.all(promises);
    return assets;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching multiple assets:", error);
    throw error;
  }
}

/**
 * Delete an asset by ID
 * 
 * @param assetId - Asset ID to delete
 * 
 * @example
 * ```typescript
 * await deleteAsset(123);
 * console.log("Asset deleted successfully");
 * ```
 */
export async function deleteAsset(assetId: number): Promise<void> {
  try {
    await axiosInstance.delete(`/api/v1/assets/${assetId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting asset ${assetId}:`, error);
    throw error;
  }
}

