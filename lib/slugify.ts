/**
 * Convert a string to a URL-friendly slug
 * Example: "Python Mastery" -> "python-mastery"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove special characters
    .replace(/[^\w\s-]/g, "")
    // Replace spaces with -
    .replace(/[\s_]+/g, "-")
    // Replace multiple - with single -
    .replace(/--+/g, "-")
    // Remove leading/trailing -
    .replace(/^-+|-+$/g, "");
}

/**
 * Create a lecture URL with SEO-friendly slugs
 */
export function createLectureUrl(
  courseTitle: string,
  courseId: string,
  lectureTitle: string,
  lectureId: string
): string {
  const courseSlug = slugify(courseTitle);
  const lectureSlug = slugify(lectureTitle);
  return `/course/${courseSlug}/learn/lecture/${lectureSlug}?course=${courseId}&lecture=${lectureId}`;
}

/**
 * Parse lecture URL to extract IDs from query params
 */
export function parseLectureUrl(searchParams: URLSearchParams): {
  courseId: string | null;
  lectureId: string | null;
} {
  return {
    courseId: searchParams.get("course"),
    lectureId: searchParams.get("lecture"),
  };
}

