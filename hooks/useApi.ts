"use client";

import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import axiosInstance from "@/app/api/axiosInstance";

type GetOptions<TData> = Omit<UseQueryOptions<TData, Error, TData, readonly unknown[]>, "queryFn"> & {
  url: string;
  params?: Record<string, unknown>;
};

export function useGetQuery<TData = unknown>({ queryKey, url, params, enabled, ...rest }: GetOptions<TData>) {
  return useQuery<TData, Error>({
    queryKey: queryKey ?? [url, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get<TData>(url, { params });
      return data;
    },
    enabled,
    ...rest,
  });
}

type MutationFn<TVars, TData> = (vars: TVars) => Promise<TData>;

export function useMutationQuery<TVars = unknown, TData = unknown>(
  mutationFn: MutationFn<TVars, TData>,
  options?: UseMutationOptions<TData, unknown, TVars>
) {
  return useMutation<TData, unknown, TVars>({ mutationFn, ...options });
}


