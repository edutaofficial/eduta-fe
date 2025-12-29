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
    // Fetch ALL published courses by paginating through all pages
    const allCourses = [];
    let currentPage = 1;
    let hasMorePages = true;
    const pageSize = 50; // Use 50 to stay within API limits

    // eslint-disable-next-line no-console
    console.log("Starting to fetch all courses for static generation...");

    while (hasMorePages && currentPage <= 20) { // Safety limit: max 20 pages = 1000 courses
      const coursesData = await searchCourses({ 
        pageSize, 
        page: currentPage,
        sortBy: "created_at",
        order: "desc"
      });

      if (coursesData?.data?.courses && coursesData.data.courses.length > 0) {
        allCourses.push(...coursesData.data.courses);
        // eslint-disable-next-line no-console
        console.log(`Fetched page ${currentPage}: ${coursesData.data.courses.length} courses (Total so far: ${allCourses.length})`);
        
        // Check if there are more pages
        const totalPages = coursesData.meta?.totalPages || 1;
        hasMorePages = currentPage < totalPages;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    // eslint-disable-next-line no-console
    console.log(`✅ Successfully fetched ${allCourses.length} courses for static generation`);

    return allCourses.map((course) => ({
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

    // Additional null checks for nested properties
    if (!course.instructor || !course.category) {
      return {
        title: course.title || "Course",
        description: course.shortDescription || "Learn from industry experts.",
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
        ratingValue: course.stats.avgRating.toString(),
        reviewCount: (course.stats.totalReviews || 0).toString(),
        bestRating: "5",
        worstRating: "1",
      } : undefined,
      offers: course.pricing?.amount !== null && course.pricing?.amount !== undefined ? {
        "@type": "Offer",
        price: course.pricing.amount.toString(),
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
        "course:price:amount": (course.pricing?.amount !== null && course.pricing?.amount !== undefined) ? course.pricing.amount.toString() : "0",
        "course:price:currency": course.pricing?.currency || "USD",
        "course:instructor": course.instructor?.name || "Unknown",
        "course:rating": (course.stats?.avgRating !== null && course.stats?.avgRating !== undefined) ? course.stats.avgRating.toString() : "0",
        "course:students": (course.stats?.totalStudents !== null && course.stats?.totalStudents !== undefined) ? course.stats.totalStudents.toString() : "0",
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
  
  // Fetch course data on the server for SEO - ensures HTML is fully rendered
  let course = undefined;
  try {
    course = await getCourseDetail(courseSlug);
  } catch (error) {
    // If fetching fails during build, log it but continue
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch course during build: ${courseSlug}`, error);
  }
  
  return <CourseDetailClient courseSlug={courseSlug} initialCourse={course ?? undefined} />;
}
