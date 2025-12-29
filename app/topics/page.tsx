import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AllCoursesPage } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";
import { searchCourses } from "@/app/api/course/searchCourses";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

export const metadata: Metadata = {
  title: "Browse All Courses",
  description:
    "Browse and explore all available courses on Eduta. Filter by category, skill level, duration, and rating. Find the perfect course to advance your career and develop new skills.",
  keywords: [
    "all courses",
    "browse courses",
    "course catalog",
    "online courses",
    "skill development",
    "professional courses",
    "learn online",
    "course search",
  ],
  alternates: {
    canonical: `${SITE_BASE_URL}/topics`,
  },
  openGraph: {
    title: "Browse All Courses - Eduta",
    description:
      "Browse and explore all available courses on Eduta. Filter by category, skill level, and rating to find the perfect course.",
    url: `${SITE_BASE_URL}/topics`,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Browse All Courses on Eduta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse All Courses - Eduta",
    description: "Browse and explore all available courses on Eduta.",
    creator: "@eduta",
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

interface AllCoursesPageRouteProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllCoursesPageRoute({ searchParams }: AllCoursesPageRouteProps) {
  const params = await searchParams;
  
  // If category or categories query params exist, redirect to slug-based route
  // This enforces the new routing structure
  if (params.category || params.categories) {
    redirect("/topics");
  }
  
  // Fetch initial courses data server-side for SEO
  let initialData = undefined;
  try {
    initialData = await searchCourses({
      pageSize: 9,
      sortBy: "created_at",
      order: "desc",
      page: 1,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching topics page data:", error);
  }
  
  return <AllCoursesPage initialData={initialData} />;
}
