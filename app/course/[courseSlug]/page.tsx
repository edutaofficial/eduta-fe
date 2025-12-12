import type { Metadata } from "next";
import { searchCourses } from "@/app/api/course/searchCourses";
import { getCourseDetail } from "@/app/api/course/getCourseDetail";
import { CourseDetailClient } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

// Generate static params for all courses at build time
export async function generateStaticParams() {
  try {
    // Fetch all published courses to generate static pages
    // Use a large pageSize to get all courses
    const coursesData = await searchCourses({ 
      pageSize: 100, 
      page: 1,
      sortBy: "created_at",
      order: "desc"
    });
    const courses = coursesData?.data || [];

    return courses.map((course) => ({
      courseSlug: course.slug,
    }));
  } catch (error) {
    // If fetching fails, return empty array - pages will be generated on-demand
    // eslint-disable-next-line no-console
    console.error("Error generating static params for courses:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  try {
    const { courseSlug } = await params;
    const course = await getCourseDetail(courseSlug);

    if (!course) {
      return {
        title: "Course Not Found",
        description: "The course you're looking for doesn't exist.",
      };
    }

    const url = `${SITE_BASE_URL}/course/${courseSlug}`;
    const imageUrl = course.courseBannerUrl || `${SITE_BASE_URL}/og-image.jpg`;

    return {
      title: course.title,
      description: course.shortDescription || course.fullDescription.substring(0, 160),
      keywords: [
        course.title,
        course.category.name,
        course.learningLevel,
        ...course.tags.map((tag) => tag.tagName),
        "online course",
        "e-learning",
      ],
      authors: [{ name: course.instructor.name }],
      creator: course.instructor.name,
      publisher: "Eduta",
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: course.title,
        description: course.shortDescription || course.fullDescription.substring(0, 160),
        url,
        siteName: "Eduta",
        locale: "en_US",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: course.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description: course.shortDescription || course.fullDescription.substring(0, 160),
        creator: "@eduta",
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      other: {
        "course:price:amount": course.pricing?.amount?.toString() || "0",
        "course:price:currency": course.pricing?.currency || "USD",
        "course:instructor": course.instructor?.name || "Unknown",
        "course:rating": course.stats?.avgRating?.toString() || "0",
        "course:students": course.stats?.totalStudents?.toString() || "0",
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating metadata for course:", error);
    return {
      title: "Course",
      description: "Explore this course on Eduta.",
    };
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  return <CourseDetailClient courseSlug={courseSlug} />;
}
