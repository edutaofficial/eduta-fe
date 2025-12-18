import type { Metadata } from "next";
import { searchCourses } from "@/app/api/course/searchCourses";
import { getInstructorProfile } from "@/app/api/instructor/getInstructorProfile";
import { InstructorProfile } from "@/components/Instructor";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

// Generate static params for all instructors at build time
// We extract instructor IDs from courses since there's no direct API for all instructors
export async function generateStaticParams() {
  try {
    // Fetch all courses to extract unique instructor IDs
    const coursesData = await searchCourses({ 
      pageSize: 9, 
      page: 1,
      sortBy: "created_at",
      order: "desc"
    });
    const courses = coursesData?.data?.courses || [];

    // Extract unique instructor IDs
    const instructorIds = new Set<number>();
    courses.forEach((course) => {
      if (course.instructor?.instructorId) {
        instructorIds.add(course.instructor.instructorId);
      }
    });

    return Array.from(instructorIds).map((id) => ({
      instructorId: id.toString(),
    }));
  } catch (error) {
    // If fetching fails, return empty array - pages will be generated on-demand
    // eslint-disable-next-line no-console
    console.error("Error generating static params for instructors:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}): Promise<Metadata> {
  try {
    const { instructorId: instructorIdParam } = await params;
    const instructorId = Number(instructorIdParam);
    if (isNaN(instructorId) || instructorId <= 0) {
      return {
        title: "Instructor Profile",
        description: "View instructor profile on Eduta.",
      };
    }

    const instructor = await getInstructorProfile(instructorId);

    if (!instructor) {
      return {
        title: "Instructor Not Found",
        description: "The instructor profile you're looking for doesn't exist.",
      };
    }

    const url = `${SITE_BASE_URL}/profile/instructor/${instructorIdParam}`;
    const imageUrl = instructor.profilePictureUrl || `${SITE_BASE_URL}/og-image.jpg`;

    return {
      title: `${instructor.fullName} - Instructor Profile`,
      description: instructor.bio || `${instructor.fullName} is an instructor on Eduta with ${instructor.stats.totalCourses} courses and ${instructor.stats.totalStudents.toLocaleString()} students.`,
      keywords: [
        instructor.fullName,
        instructor.specialization,
        instructor.professionalTitle || "",
        "instructor",
        "online courses",
        "e-learning",
        "Eduta instructor",
      ].filter(Boolean),
      authors: [{ name: instructor.fullName }],
      creator: instructor.fullName,
      publisher: "Eduta",
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: `${instructor.fullName} - Instructor on Eduta`,
        description: instructor.bio || `${instructor.fullName} is an instructor on Eduta.`,
        url,
        siteName: "Eduta",
        locale: "en_US",
        type: "profile",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: instructor.fullName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${instructor.fullName} - Instructor on Eduta`,
        description: instructor.bio || `${instructor.fullName} is an instructor on Eduta.`,
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
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating metadata for instructor:", error);
    return {
      title: "Instructor Profile",
      description: "View instructor profile on Eduta.",
    };
  }
}

export default async function InstructorProfilePage({ params }: { params: Promise<{ instructorId: string }> }) {
  const { instructorId: instructorIdParam } = await params;
  const instructorId = Number(instructorIdParam);
  
  if (isNaN(instructorId) || instructorId <= 0) {
    return (
      <div className="min-h-screen bg-default-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-default-900 mb-2">
            Invalid Instructor ID
          </h1>
          <p className="text-default-600">The instructor ID is invalid.</p>
        </div>
      </div>
    );
  }

  return <InstructorProfile instructorId={instructorId} />;
}
