import { getBaseUrl } from "@/lib/config/api";
import type { BlogDetailResponse } from "@/types/blog";

export async function getBlogBySlug(slug: string): Promise<BlogDetailResponse> {
  const url = `${getBaseUrl()}api/v1/blog/${slug}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog: ${response.statusText}`);
  }

  return response.json();
}

