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

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Use force-cache for SSG, but allow override via filters
      cache: filters.search || filters.tag ? "no-store" : "force-cache",
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    });

    if (!response.ok) {
      // Log the actual response for debugging
      const errorText = await response.text().catch(() => response.statusText);
      // eslint-disable-next-line no-console
      console.error(`Blog API error (${response.status}):`, errorText);
      
      // Return empty result instead of throwing
      return {
        status: "error",
        message: `Failed to fetch blogs: ${response.statusText}`,
        data: {
          posts: [],
        },
        meta: {
          currentPage: page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          totalPosts: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in getAllBlogs:", error);
    
    // Return empty result instead of throwing
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      data: {
        posts: [],
      },
      meta: {
        currentPage: page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        totalPosts: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
}

