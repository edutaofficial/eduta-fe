"use client";

import { create } from "zustand";
import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";
import { 
  getEnrolledCourses, 
  type EnrolledCourse 
} from "@/app/api/learner/getEnrolledCourses";
import { 
  getCertificates, 
  type Certificate 
} from "@/app/api/learner/getCertificates";
import {
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  type WishlistItem,
} from "@/app/api/learner/wishlist";

export interface LearnerProfile {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  profile_picture: number | null; // Backend uses profile_picture (not profile_picture_id)
  created_at: string;
  updated_at: string;
}

export interface UpdateLearnerProfileRequest {
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  profile_picture?: number | null; // Backend expects profile_picture (not profile_picture_id)
}

interface LearnerState {
  profile: LearnerProfile | null;
  enrolledCourses: EnrolledCourse[];
  coursesStats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
  };
  certificates: Certificate[];
  certificatesStats: {
    totalCertificates: number;
    activeCertificates: number;
  };
  wishlist: WishlistItem[];
  wishlistStats: {
    totalItems: number;
  };
  loading: {
    fetchProfile: boolean;
    updateProfile: boolean;
    fetchEnrolledCourses: boolean;
    fetchCertificates: boolean;
    fetchWishlist: boolean;
    addToWishlist: boolean;
    removeFromWishlist: boolean;
  };
  error: string | null;
}

interface LearnerActions {
  fetchProfile: () => Promise<LearnerProfile>;
  updateProfile: (data: UpdateLearnerProfileRequest) => Promise<LearnerProfile>;
  fetchEnrolledCourses: () => Promise<void>;
  fetchCertificates: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (courseId: string) => Promise<void>;
  removeFromWishlist: (courseId: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

export type LearnerStore = LearnerState & LearnerActions;

const initialState: LearnerState = {
  profile: null,
  enrolledCourses: [],
  coursesStats: {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
  },
  certificates: [],
  certificatesStats: {
    totalCertificates: 0,
    activeCertificates: 0,
  },
  wishlist: [],
  wishlistStats: {
    totalItems: 0,
  },
  loading: {
    fetchProfile: false,
    updateProfile: false,
    fetchEnrolledCourses: false,
    fetchCertificates: false,
    fetchWishlist: false,
    addToWishlist: false,
    removeFromWishlist: false,
  },
  error: null,
};

export const useLearnerStore = create<LearnerStore>((set) => ({
  ...initialState,

  fetchProfile: async () => {
    set((state) => ({
      loading: { ...state.loading, fetchProfile: true },
      error: null,
    }));

    try {
      const response = await axiosInstance.get<{
        first_name: string;
        last_name: string;
        phone_number: string | null;
        date_of_birth: string | null;
        profile_picture: number | null;
        created_at: string;
        updated_at: string;
      }>("/api/v1/learner/profile");

      const profile: LearnerProfile = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        date_of_birth: response.data.date_of_birth,
        profile_picture: response.data.profile_picture,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
      };

      // eslint-disable-next-line no-console
      console.log("Learner profile fetched:", profile);

      set((state) => ({
        profile,
        loading: { ...state.loading, fetchProfile: false },
        error: null,
      }));

      return profile;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, fetchProfile: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  updateProfile: async (data: UpdateLearnerProfileRequest) => {
    set((state) => ({
      loading: { ...state.loading, updateProfile: true },
      error: null,
    }));

    try {
      // Ensure profile_picture is always sent, convert to number if it exists
      const profilePictureValue = data.profile_picture !== null && data.profile_picture !== undefined
        ? Number(data.profile_picture)
        : null;

      const requestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || null,
        date_of_birth: data.date_of_birth || null,
        profile_picture: profilePictureValue, // Backend expects profile_picture (not profile_picture_id)
      };

      // eslint-disable-next-line no-console
      console.log("📤 Sending learner profile update:", requestData);
      // eslint-disable-next-line no-console
      console.log("📤 profile_picture value:", profilePictureValue, typeof profilePictureValue);

      const response = await axiosInstance.post<{
        first_name: string;
        last_name: string;
        phone_number: string | null;
        date_of_birth: string | null;
        profile_picture: number | null;
        created_at: string;
        updated_at: string;
      }>("/api/v1/learner/profile", requestData);

      const profile: LearnerProfile = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        date_of_birth: response.data.date_of_birth,
        profile_picture: response.data.profile_picture,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
      };

      set((state) => ({
        profile,
        loading: { ...state.loading, updateProfile: false },
        error: null,
      }));

      return profile;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, updateProfile: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  fetchEnrolledCourses: async () => {
    set((state) => ({
      loading: { ...state.loading, fetchEnrolledCourses: true },
      error: null,
    }));

    try {
      const data = await getEnrolledCourses();

      set((state) => ({
        enrolledCourses: data.courses,
        coursesStats: {
          totalCourses: data.totalCourses,
          completedCourses: data.completedCourses,
          inProgressCourses: data.inProgressCourses,
        },
        loading: { ...state.loading, fetchEnrolledCourses: false },
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, fetchEnrolledCourses: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  fetchCertificates: async () => {
    set((state) => ({
      loading: { ...state.loading, fetchCertificates: true },
      error: null,
    }));

    try {
      const data = await getCertificates();

      set((state) => ({
        certificates: data.certificates,
        certificatesStats: {
          totalCertificates: data.totalCertificates,
          activeCertificates: data.activeCertificates,
        },
        loading: { ...state.loading, fetchCertificates: false },
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, fetchCertificates: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  fetchWishlist: async () => {
    set((state) => ({
      loading: { ...state.loading, fetchWishlist: true },
      error: null,
    }));

    try {
      const data = await getWishlist();

      set((state) => ({
        wishlist: data.items,
        wishlistStats: {
          totalItems: data.totalItems,
        },
        loading: { ...state.loading, fetchWishlist: false },
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, fetchWishlist: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  addToWishlist: async (courseId: string) => {
    set((state) => ({
      loading: { ...state.loading, addToWishlist: true },
      error: null,
    }));

    try {
      await addToWishlistApi(courseId);

      // Refetch wishlist to update
      const data = await getWishlist();

      set((state) => ({
        wishlist: data.items,
        wishlistStats: {
          totalItems: data.totalItems,
        },
        loading: { ...state.loading, addToWishlist: false },
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, addToWishlist: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  removeFromWishlist: async (courseId: string) => {
    set((state) => ({
      loading: { ...state.loading, removeFromWishlist: true },
      error: null,
    }));

    try {
      await removeFromWishlistApi(courseId);

      // Refetch wishlist to update
      const data = await getWishlist();

      set((state) => ({
        wishlist: data.items,
        wishlistStats: {
          totalItems: data.totalItems,
        },
        loading: { ...state.loading, removeFromWishlist: false },
        error: null,
      }));
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      set((state) => ({
        loading: { ...state.loading, removeFromWishlist: false },
        error: errorMessage,
      }));
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetStore: () => set(initialState),
}));

