import * as React from "react";
import { useFormik } from "formik";
import * as z from "zod";
import { useCourseStore } from "@/store/useCourseStore";
import type { UICurriculum } from "@/types/course";
import type { UploadedFile } from "@/components/Common";
import type { CurriculumFormData, SectionFormData, LectureFormData } from "@/types/curriculum";
import {
  transformStoreToFormData,
  createDefaultSection,
  createDefaultLecture,
  isSectionValid,
  findFirstInvalidField,
} from "@/lib/curriculumUtils";

// Zod schema for validation
const curriculumSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.union([z.number(), z.string()]),
        name: z.string().min(1, "Section name is required"),
        description: z.string().min(1, "Section description is required"),
        lectures: z.array(
          z.object({
            id: z.union([z.number(), z.string()]),
            name: z.string().min(1, "Lecture name is required"),
            description: z.string().min(1, "Lecture description is required"),
            video: z.number().min(1, "Lecture video is required"),
            resources: z.array(z.any()).optional(),
            duration: z.number().optional(),
            isPreview: z.boolean().optional(),
          })
        ),
      })
    )
    .min(1),
});

/**
 * Custom hook for managing curriculum form state and actions
 * Encapsulates all form logic, validation, and Zustand integration
 */
export function useCurriculumForm() {
  const { curriculum, setCurriculum, setUploading } = useCourseStore();
  const [showErrors, setShowErrors] = React.useState(false);
  const [uploadingLectures, setUploadingLectures] = React.useState<Record<string, boolean>>({});
  
  // Stable ID generator
  const nextIdRef = React.useRef(2);
  const getNextId = () => {
    nextIdRef.current += 1;
    return nextIdRef.current;
  };

  // Initialize form with store data
  const initialSections = transformStoreToFormData(curriculum);

  const formik = useFormik<CurriculumFormData>({
    initialValues: {
      sections: initialSections,
    },
    validate: (values) => {
      const result = curriculumSchema.safeParse(values);
      if (result.success) return {} as Record<string, unknown>;
      
      const errors: Record<string, unknown> = {};
      for (const issue of result.error.issues) {
        const segments = issue.path as (string | number)[];
        let curr: Record<string, unknown> = errors;
        segments.forEach((seg, idx) => {
          const key = String(seg);
          if (idx === segments.length - 1) {
            curr[key] = issue.message;
          } else {
            if (typeof curr[key] !== "object" || curr[key] === null)
              curr[key] = {};
            curr = curr[key] as Record<string, unknown>;
          }
        });
      }
      return errors as Record<string, unknown>;
    },
    onSubmit: () => {},
  });

  // Sync formik values to Zustand store
  React.useEffect(() => {
    setCurriculum({
      sections: formik.values.sections as unknown as UICurriculum["sections"],
    });
  }, [formik.values.sections, setCurriculum]);

  // Track upload states and update store
  const prevUploadingRef = React.useRef<Record<string, boolean>>({});
  React.useEffect(() => {
    const isAnyUploading = Object.values(uploadingLectures).some(Boolean);
    const prevIsAnyUploading = Object.values(prevUploadingRef.current).some(Boolean);

    if (isAnyUploading !== prevIsAnyUploading) {
      prevUploadingRef.current = uploadingLectures;
      setUploading({ curriculum: isAnyUploading });
    }
  }, [uploadingLectures, setUploading]);

  // === Section Actions ===
  
  const addSection = React.useCallback(() => {
    const newSection = createDefaultSection(getNextId());
    newSection.lectures[0].id = getNextId();
    formik.setFieldValue("sections", [...formik.values.sections, newSection]);
  }, [formik]);

  const removeSection = React.useCallback((sectionId: number | string) => {
    const updated = formik.values.sections.filter((s) => s.id !== sectionId);
    formik.setFieldValue("sections", updated);
  }, [formik]);

  const updateSection = React.useCallback((
    sectionId: number | string,
    field: keyof SectionFormData,
    value: string
  ) => {
    const updated = formik.values.sections.map((s) =>
      s.id === sectionId ? { ...s, [field]: value } : s
    );
    formik.setFieldValue("sections", updated);
  }, [formik]);

  // === Lecture Actions ===
  
  const addLecture = React.useCallback((sectionId: number | string) => {
    const newLecture = createDefaultLecture(getNextId());
    const updated = formik.values.sections.map((s) =>
      s.id === sectionId
        ? { ...s, lectures: [...s.lectures, newLecture] }
        : s
    );
    formik.setFieldValue("sections", updated);
  }, [formik]);

  const removeLecture = React.useCallback((
    sectionId: number | string,
    lectureId: number | string
  ) => {
    const updated = formik.values.sections.map((s) =>
      s.id === sectionId
        ? { ...s, lectures: s.lectures.filter((lec) => lec.id !== lectureId) }
        : s
    );
    formik.setFieldValue("sections", updated);
  }, [formik]);

  const updateLecture = React.useCallback((
    sectionId: number | string,
    lectureId: number | string,
    field: keyof LectureFormData,
    value: string | number | boolean | UploadedFile[]
  ) => {
    const updated = formik.values.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            lectures: s.lectures.map((lec) =>
              lec.id === lectureId
                ? {
                    ...lec,
                    [field]:
                      field === "duration" || field === "video"
                        ? typeof value === "number"
                          ? value
                          : value
                            ? parseInt(String(value), 10)
                            : 0
                        : field === "isPreview"
                          ? typeof value === "boolean"
                            ? value
                            : value === "true"
                          : value,
                  }
                : lec
            ),
          }
        : s
    );
    formik.setFieldValue("sections", updated);
  }, [formik]);

  // Update multiple lecture fields atomically (prevents race conditions)
  const updateMultipleLectureFields = React.useCallback((
    sectionId: number | string,
    lectureId: number | string,
    updates: Partial<LectureFormData>
  ) => {
    const updated = formik.values.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            lectures: s.lectures.map((lec) =>
              lec.id === lectureId
                ? { ...lec, ...updates }
                : lec
            ),
          }
        : s
    );
    formik.setFieldValue("sections", updated);
  }, [formik]);

  // Handle lecture upload state changes
  const handleLectureUploadStateChange = React.useCallback(
    (sectionId: number | string, lectureId: number | string, isUploading: boolean) => {
      const key = `${sectionId}-${lectureId}`;
      setUploadingLectures((prev) => {
        // If upload is complete (false), remove the key entirely
        if (!isUploading) {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        }
        // If already in this state, don't update
        if (prev[key] === isUploading) return prev;
        // Add new uploading state
        return { ...prev, [key]: isUploading };
      });
    },
    []
  );

  // Cleanup upload states when lectures are removed
  React.useEffect(() => {
    setUploadingLectures((prev) => {
      const newState = { ...prev };
      let hasChanges = false;

      // Check if any uploading lecture no longer exists
      Object.keys(newState).forEach((key) => {
        const [sectionId, lectureId] = key.split("-");
        const sectionExists = formik.values.sections.some(
          (s) => String(s.id) === sectionId
        );
        if (!sectionExists) {
          delete newState[key];
          hasChanges = true;
          return;
        }

        const section = formik.values.sections.find(
          (s) => String(s.id) === sectionId
        );
        const lectureExists = section?.lectures.some(
          (l) => String(l.id) === lectureId
        );
        if (!lectureExists) {
          delete newState[key];
          hasChanges = true;
        }
      });

      return hasChanges ? newState : prev;
    });
  }, [formik.values.sections]);

  // === Validation ===
  
  const validateAndFocus = React.useCallback(async (): Promise<boolean> => {
    const allValid = formik.values.sections.every(isSectionValid);

    if (allValid) return true;

    setShowErrors(true);
    
    // Find first invalid field and return info to expand its accordion
    for (const section of formik.values.sections) {
      const invalid = findFirstInvalidField(section);
      if (invalid) {
        return false;
      }
    }

    return false;
  }, [formik.values.sections]);

  // Get first invalid section and lecture for accordion expansion
  const getFirstInvalidIds = React.useCallback((): {
    sectionId: string | number | null;
    lectureId: string | number | null;
    fieldId: string | null;
  } => {
    for (const section of formik.values.sections) {
      const invalid = findFirstInvalidField(section);
      if (invalid) {
        // Check if error is in section or lecture
        if (invalid.type.startsWith("section")) {
          return {
            sectionId: section.id,
            lectureId: null,
            fieldId: `${invalid.type}-${invalid.id}`,
          };
        } else {
          // Error is in a lecture
          return {
            sectionId: section.id,
            lectureId: invalid.id,
            fieldId: `${invalid.type}-${invalid.id}`,
          };
        }
      }
    }
    return { sectionId: null, lectureId: null, fieldId: null };
  }, [formik.values.sections]);

  return {
    // State
    sections: formik.values.sections,
    showErrors,
    
    // Section actions
    addSection,
    removeSection,
    updateSection,
    
    // Lecture actions
    addLecture,
    removeLecture,
    updateLecture,
    updateMultipleLectureFields,
    handleLectureUploadStateChange,
    
    // Validation
    validateAndFocus,
    getFirstInvalidIds,
  };
}

