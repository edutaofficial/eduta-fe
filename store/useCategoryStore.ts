import { create } from "zustand";
import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

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
  subcategories: Subcategory[];
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

interface CategoryActions {
  fetchCategories: () => Promise<void>;
}

type CategoryStore = CategoryState & CategoryActions;

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get<{
        success: boolean;
        message: string;
        data: Category[];
      }>("/api/instructor/categories");

      set({ categories: data.data, loading: false });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

