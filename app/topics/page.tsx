import type { Metadata } from "next";
import { AllCoursesPage } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

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

export default function AllCoursesPageRoute() {
  return <AllCoursesPage />;
}
