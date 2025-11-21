"use client";

import { create } from "zustand";
import axiosInstance from "@/app/api/axiosInstance";
import { extractErrorMessage } from "@/lib/errorUtils";

export interface InstructorProfile {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  specialization: string;
  profile_picture_id: number | null;
  profile_picture_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateInstructorProfileRequest {
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  specialization?: string;
  profile_picture_id?: number | null;
  bio?: string;
}

interface InstructorState {
  profile: InstructorProfile | null;
  loading: {
    fetchProfile: boolean;
    updateProfile: boolean;
  };
  error: string | null;
}

interface InstructorActions {
  fetchProfile: () => Promise<InstructorProfile>;
  updateProfile: (data: UpdateInstructorProfileRequest) => Promise<InstructorProfile>;
  clearError: () => void;
  resetStore: () => void;
}

export type InstructorStore = InstructorState & InstructorActions;

const initialState: InstructorState = {
  profile: null,
  loading: {
    fetchProfile: false,
    updateProfile: false,
  },
  error: null,
};

export const useInstructorStore = create<InstructorStore>((set) => ({
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
        specialization: string;
        profile_picture_id: number | null;
        profile_picture_url: string;
        bio: string;
        created_at: string;
        updated_at: string;
      }>("/api/v1/instructor/profile");

      // Map backend response to our interface
      const profile: InstructorProfile = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        specialization: response.data.specialization,
        profile_picture_id: response.data.profile_picture_id,
        profile_picture_url: response.data.profile_picture_url,
        bio: response.data.bio,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
      };

      // eslint-disable-next-line no-console
      console.log("Backend profile_picture value:", response.data.profile_picture_id);
      // eslint-disable-next-line no-console
      console.log("Mapped profile_picture_id:", profile.profile_picture_id);

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

  updateProfile: async (data: UpdateInstructorProfileRequest) => {
    set((state) => ({
      loading: { ...state.loading, updateProfile: true },
      error: null,
    }));

    try {
      // Map our interface to backend format
      const requestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        specialization: data.specialization,
        profile_picture_id: data.profile_picture_id, // Backend expects profile_picture
        bio: data.bio,
      };

      const response = await axiosInstance.post<{
        first_name: string;
        last_name: string;
        phone_number: string | null;
        specialization: string;
        profile_picture_id: number | null;
        profile_picture_url: string;
        bio: string;
        created_at: string;
        updated_at: string;
      }>("/api/v1/instructor/profile", requestData);

      // Map backend response to our interface
      const profile: InstructorProfile = {
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number,
        specialization: response.data.specialization,
        profile_picture_id: response.data.profile_picture_id,
        profile_picture_url: response.data.profile_picture_url,
        bio: response.data.bio,
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

  clearError: () => set({ error: null }),

  resetStore: () => set(initialState),
}));

