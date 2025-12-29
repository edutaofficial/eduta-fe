/**
 * Course Details Types
 * Type definitions for the Course Details form and components
 */

export interface LearningPoint {
  id: number;
  text: string;
}

export interface BulletPoint {
  id: number;
  text: string;
}

export interface CourseDetailsFormValues {
  courseTitle: string;
  selectedCategory: string;
  learningLevel: string;
  shortDescription: string;
  fullDescription: string;
  learningPoints: LearningPoint[];
  requirements: BulletPoint[];
  whoThisCourseIsFor: BulletPoint[];
  certificateDescription: string;
  promoVideoId: number | null;
  courseBannerId: number | null;
}

export interface CourseDetailsFormProps {
  initialValues: CourseDetailsFormValues;
  onSubmit: (values: CourseDetailsFormValues) => void | Promise<void>;
  onPreview?: () => void;
  isSubmitting?: boolean;
}

export interface CourseDetailsHandle {
  validateAndFocus: () => Promise<boolean>;
  getValues: () => CourseDetailsFormValues;
}

