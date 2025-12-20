"use client";

import { useMutationQuery, useGetQuery } from "@/hooks/useApi";
import axiosInstance from "@/app/api/axiosInstance";
import type { Asset } from "@/types/course";

export function useUpload() {
  const uploadAsset = useMutationQuery<FormData, Asset>(async (formData) => {
    const { data } = await axiosInstance.post<Asset>("/api/v1/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  });

  const useGetAssetById = (assetId: number) =>
    useGetQuery<Asset>({ 
      queryKey: ["asset", assetId], 
      url: `/api/v1/assets/${assetId}`,
      enabled: assetId > 0, // Only fetch if assetId is valid
      refetchOnWindowFocus: false, // Prevent refetch when switching tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return { uploadAsset, useGetAssetById };
}


