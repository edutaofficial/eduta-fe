import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface WishlistItem {
  wishlistId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  shortDescription: string;
  learningLevel: string;
  language: string;
  courseBannerId: number;
  courseBannerUrl?: string; // Optional: URL to course banner image
  courseLogoId: number;
  courseLogoUrl?: string; // Optional: URL to course logo image
  instructorId: number;
  instructorName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  currency: string;
  originalPrice: number | null;
  discountPercentage: number;
  avgRating: number;
  totalReviews: number;
  totalStudents: number;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: {
    totalItems: number;
    items: WishlistItem[];
  };
}

export interface AddToWishlistResponse {
  success: boolean;
  message: string;
  data: {
    wishlistId: string;
    courseId: string;
    courseTitle: string;
    addedAt: string;
  };
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
  data: {
    courseId: string;
    courseTitle: string;
    removedAt: string;
  };
}

/**
 * Get wishlist for learner
 */
export async function getWishlist(): Promise<WishlistResponse["data"]> {
  try {
    const { data } = await axiosInstance.get<WishlistResponse>(
      "/api/v1/learner/wishlist"
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Add course to wishlist
 */
export async function addToWishlist(
  courseId: string
): Promise<AddToWishlistResponse["data"]> {
  try {
    const { data } = await axiosInstance.post<AddToWishlistResponse>(
      "/api/v1/learner/wishlist/add",
      { course_id: courseId }
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * Remove course from wishlist
 */
export async function removeFromWishlist(
  courseId: string
): Promise<RemoveFromWishlistResponse["data"]> {
  try {
    const { data } = await axiosInstance.delete<RemoveFromWishlistResponse>(
      "/api/v1/learner/wishlist/remove",
      { data: { course_id: courseId } }
    );

    return data.data;
  } catch (error: unknown) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
}

