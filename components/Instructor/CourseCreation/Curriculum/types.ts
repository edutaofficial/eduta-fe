import type { UploadedFile } from "@/components/Common";

export interface LectureFormData {
  id: number | string;
  name: string;
  description: string;
  video: number;
  resources: UploadedFile[];
  duration: number;
  isPreview: boolean;
}

export interface SectionFormData {
  id: number | string;
  name: string;
  description: string;
  lectures: LectureFormData[];
}

export interface CurriculumFormData {
  sections: SectionFormData[];
}

export interface CurriculumHandle {
  validateAndFocus: () => Promise<boolean>;
}

export interface TitleDescriptionFieldsProps {
  id: string | number;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleLabel: string;
  descriptionLabel: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  showErrors: boolean;
  variant: "section" | "lecture";
}

export interface LectureVideoUploadProps {
  lectureId: string | number;
  videoId: number;
  duration: number;
  onVideoChange: (assetId: number | null, file?: File) => void;
  onUploadStateChange: (isUploading: boolean) => void;
  showErrors: boolean;
}

export interface LectureResourcesUploadProps {
  resources: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

