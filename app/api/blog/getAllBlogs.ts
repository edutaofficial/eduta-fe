import { getBaseUrl } from "@/lib/config/api";
import type { BlogListResponse, BlogFilters } from "@/types/blog";

export async function getAllBlogs(
  filters: BlogFilters = {}
): Promise<BlogListResponse> {
  const {
    categoryId,
    tag,
    search,
    isFeatured,
    page = 1,
    pageSize = 12,
  } = filters;

  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId);
  if (tag) params.append("tag", tag);
  if (search) params.append("search", search);
  if (isFeatured !== undefined)
    params.append("isFeatured", String(isFeatured));
  params.append("page", String(page));
  params.append("pageSize", String(pageSize));

  const url = `${getBaseUrl()}api/v1/blog?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Use force-cache for SSG, but allow override via filters
    cache: filters.search || filters.tag ? "no-store" : "force-cache",
    next: { revalidate: 3600 }, // Revalidate every hour
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blogs: ${response.statusText}`);
  }

  return response.json();
}

