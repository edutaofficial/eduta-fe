import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LecturePlayerClient } from "@/components/Learn/LecturePlayerClient";

interface LecturePageProps {
  params: Promise<{
    courseSlug: string;
    lectureSlug: string;
  }>;
  searchParams: Promise<{
    course?: string;
    lecture?: string;
  }>;
}

/**
 * Generate metadata for SEO
 * Note: Since lecture pages require authentication, we generate basic metadata
 * without fetching course content to avoid 403 errors during SSR
 */
export async function generateMetadata({
  params,
  searchParams,
}: LecturePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { courseSlug, lectureSlug } = resolvedParams;
  const courseId = resolvedSearchParams.course;
  const lectureId = resolvedSearchParams.lecture;

  if (!courseId || !lectureId) {
    return {
      title: "Lecture Not Found - Eduta",
      description: "The requested lecture could not be found.",
    };
  }

  // Convert slugs to readable titles (remove hyphens, capitalize)
  const courseTitle = courseSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const lectureTitle = lectureSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Construct canonical URL using slugs
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://eduta.org"}/course/${courseSlug}/learn/lecture/${lectureSlug}?course=${courseId}&lecture=${lectureId}`;

  return {
    title: `${lectureTitle} - ${courseTitle} | Eduta`,
    description: `Learn ${lectureTitle} in ${courseTitle}. Access your course lectures and track your progress on Eduta.`,
    openGraph: {
      title: `${lectureTitle} - ${courseTitle}`,
      description: `Learn ${lectureTitle} in ${courseTitle} on Eduta.`,
      type: "video.other",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${lectureTitle} - ${courseTitle}`,
      description: `Learn ${lectureTitle} in ${courseTitle} on Eduta.`,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false, // Don't index lecture pages (requires authentication)
      follow: true,
    },
  };
}

/**
 * Server Component - Lecture Player Page
 * Implements ISR with 1 hour revalidation
 */
export const revalidate = 3600; // Revalidate every 1 hour (ISR)

export default async function LecturePlayerPage({
  params,
  searchParams,
}: LecturePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const courseId = resolvedSearchParams.course;
  const lectureId = resolvedSearchParams.lecture;

  // Validate required query parameters
  if (!courseId || !lectureId) {
    notFound();
  }

  // Validate slug format (basic check)
  if (
    !resolvedParams.courseSlug ||
    !resolvedParams.lectureSlug ||
    resolvedParams.courseSlug.length < 2 ||
    resolvedParams.lectureSlug.length < 2
  ) {
    notFound();
  }

  // Render the client component with validated props
  return <LecturePlayerClient courseId={courseId} lectureId={lectureId} />;
}
