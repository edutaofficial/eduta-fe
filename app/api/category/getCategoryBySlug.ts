import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface CategoryFAQ {
  faqId: string;
  question: string;
  answer: string;
}

export interface SubcategoryDetail {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  iconId: number;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ParentCategoryInfo {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
}

export interface CategoryDetail {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  iconId: number;
  iconUrl: string;
  parentId: string | null;
  parent: ParentCategoryInfo | null;
  isActive: boolean;
  displayOrder: number;
  subcategories: SubcategoryDetail[];
  faqs: CategoryFAQ[];
  createdAt: string;
  updatedAt: string;
}

export interface GetCategoryBySlugResponse {
  success: boolean;
  message: string;
  data: CategoryDetail;
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDetail> {
  try {
    const { data } = await axiosInstance.get<GetCategoryBySlugResponse>(
      `/api/v1/categories/${slug}`
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch category details");
    }

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    const errorWithOriginal = enhancedError as Error & { originalError?: unknown };
    errorWithOriginal.originalError = error;
    throw enhancedError;
  }
}

