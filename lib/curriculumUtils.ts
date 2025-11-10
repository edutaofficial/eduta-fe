import type { UICurriculum } from "@/types/course";
import type { LectureFormData, SectionFormData } from "@/types/curriculum";

/**
 * Transform store curriculum data to form data structure
 */
export function transformStoreToFormData(
  curriculum: UICurriculum
): SectionFormData[] {
  if (!curriculum.sections || curriculum.sections.length === 0) {
    return [createDefaultSection(1)];
  }

  return curriculum.sections.map((section) => ({
    id: section.id,
    name: "title" in section ? section.title : (section as { name: string }).name,
    description: section.description,
    lectures: section.lectures.map((lecture) => ({
      id: lecture.id,
      name:
        "title" in lecture
          ? lecture.title
          : (lecture as { name: string }).name,
      description: lecture.description,
      video:
        "videoId" in lecture
          ? lecture.videoId || 0
          : (lecture as { video: number }).video || 0,
      resources:
        "resources" in lecture && Array.isArray(lecture.resources)
          ? lecture.resources.map((r) => ({
              assetId: r.fileId,
              fileName: r.title || "Resource",
              fileSize: "",
            }))
          : [],
      duration: lecture.duration || 0,
      isPreview:
        "isFree" in lecture
          ? lecture.isFree
          : (lecture as { isPreview?: boolean }).isPreview || false,
    })),
  }));
}

/**
 * Create a default section with one lecture
 */
export function createDefaultSection(id: number | string): SectionFormData {
  return {
    id,
    name: "",
    description: "",
    lectures: [createDefaultLecture(id)],
  };
}

/**
 * Create a default lecture
 */
export function createDefaultLecture(id: number | string): LectureFormData {
  return {
    id,
    name: "",
    description: "",
    video: 0,
    resources: [],
    duration: 0,
    isPreview: false,
  };
}

/**
 * Validate if a section is complete and valid
 */
export function isSectionValid(section: SectionFormData): boolean {
  if (!section.name.trim()) return false;
  if (!section.description.trim()) return false;

  return section.lectures.every(isLectureValid);
}

/**
 * Validate if a lecture is complete and valid
 */
export function isLectureValid(lecture: LectureFormData): boolean {
  if (!lecture.name.trim()) return false;
  if (!lecture.description.trim()) return false;
  if (!lecture.video || lecture.video === 0) return false;
  
  return true;
}

/**
 * Find the first invalid field in a section and return its ID for scrolling
 */
export function findFirstInvalidField(
  section: SectionFormData
): { type: string; id: string | number } | null {
  if (!section.name.trim()) {
    return { type: "section-name", id: section.id };
  }
  if (!section.description.trim()) {
    return { type: "section-desc", id: section.id };
  }

  for (const lecture of section.lectures) {
    if (!lecture.name.trim()) {
      return { type: "lecture-name", id: lecture.id };
    }
    if (!lecture.description.trim()) {
      return { type: "lecture-desc", id: lecture.id };
    }
    if (!lecture.video || lecture.video === 0) {
      return { type: "lecture-video", id: lecture.id };
    }
  }

  return null;
}

/**
 * Scroll to an element smoothly
 */
export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId);
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}

