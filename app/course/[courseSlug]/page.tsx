import type { Metadata } from "next";
import { searchCourses } from "@/app/api/course/searchCourses";
import { getCourseDetail } from "@/app/api/course/getCourseDetail";
import { CourseDetailClient } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

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
    const courses = coursesData?.data.courses || [];

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

    // Generate structured data for rich snippets
    const courseSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.shortDescription || course.fullDescription.substring(0, 300),
      provider: {
        "@type": "Organization",
        name: "Eduta",
        url: SITE_BASE_URL,
      },
      instructor: {
        "@type": "Person",
        name: course.instructor.name,
      },
      aggregateRating: course.stats?.avgRating ? {
        "@type": "AggregateRating",
        ratingValue: course.stats.avgRating,
        reviewCount: course.stats.totalReviews,
        bestRating: "5",
        worstRating: "1",
      } : undefined,
      offers: course.pricing ? {
        "@type": "Offer",
        price: course.pricing.amount || "0",
        priceCurrency: course.pricing.currency || "USD",
        availability: "https://schema.org/InStock",
        url,
      } : undefined,
      image: imageUrl,
      url,
      courseCode: course.slug,
      educationalLevel: course.learningLevel,
      numberOfLectures: course.stats?.totalLectures,
      timeRequired: course.stats?.totalDurationFormatted,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Courses",
          item: `${SITE_BASE_URL}/topics`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: course.category.name,
          item: `${SITE_BASE_URL}/category/${course.category.slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: course.title,
          item: url,
        },
      ],
    };

    return {
      title: course.title,
      description: course.shortDescription || "Learn from industry experts and upgrade your potencies",
      keywords: [
        course.title,
        course.category.name,
        course.learningLevel,
        ...course.tags.map((tag) => tag.tagName),
        "online course",
        "e-learning",
        "skill development",
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
        // Add structured data as JSON-LD
        "application-ld+json": JSON.stringify([courseSchema, breadcrumbSchema]),
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
