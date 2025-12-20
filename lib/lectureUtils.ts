import type { Lecture, Section } from "@/app/api/learner/getCourseContent";

/**
 * Find a lecture by its ID within course sections
 */
export function findLectureById(sections: Section[], lectureId: string) {
  for (const section of sections) {
    const lecture = section.lectures.find((l) => l.lectureId === lectureId);
    if (lecture) {
      return { lecture, section };
    }
  }
  return null;
}

/**
 * Find the next or previous lecture relative to the current one
 */
export function findAdjacentLecture(
  sections: Section[],
  currentLectureId: string,
  direction: "next" | "previous"
): Lecture | null {
  const allLectures: Lecture[] = [];
  sections.forEach((section) => {
    allLectures.push(...section.lectures);
  });

  const currentIndex = allLectures.findIndex(
    (l) => l.lectureId === currentLectureId
  );

  if (currentIndex === -1) return null;

  if (direction === "next") {
    return allLectures[currentIndex + 1] || null;
  } else {
    return allLectures[currentIndex - 1] || null;
  }
}

/**
 * Find the first incomplete lecture in the course
 * If all lectures are completed, returns the first lecture
 */
export function findFirstIncompleteLecture(sections: Section[]): Lecture | null {
  for (const section of sections) {
    const incompleteLecture = section.lectures.find((l) => !l.isCompleted);
    if (incompleteLecture) return incompleteLecture;
  }
  // If all completed, return first lecture
  return sections[0]?.lectures[0] || null;
}

/**
 * Format duration from minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return "0m";

  // If 60 minutes or more, show in "XhYm" format
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`;
  }

  // Otherwise show in "Xm" format
  return `${minutes}m`;
}

/**
 * Generate notes storage key for localStorage
 */
export function generateNotesStorageKey(
  courseId: string,
  lectureId: string
): string {
  return `lecture-notes-${courseId}-${lectureId}`;
}

/**
 * Generate congratulations shown key for localStorage
 */
export function generateCongratsShownKey(courseId: string): string {
  return `congrats-shown-${courseId}`;
}

