import { getBaseUrl } from "@/lib/config/api";

export interface Subcategory {
  categoryId: string;
  name: string;
  slug: string;
  parentId: string;
}

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
}

export interface GetAllCategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export async function getAllCategories(): Promise<GetAllCategoriesResponse> {
  const url = `${getBaseUrl()}api/instructor/categories`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    });

    if (!response.ok) {
      // Log error and return empty categories
      const errorText = await response.text().catch(() => response.statusText);
      // eslint-disable-next-line no-console
      console.error(`Categories API error (${response.status}):`, errorText);
      
      return {
        success: false,
        message: `Failed to fetch categories: ${response.statusText}`,
        data: [],
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in getAllCategories:", error);
    return {
      success: false,
      message: "Failed to fetch categories",
      data: [],
    };
  }
}

