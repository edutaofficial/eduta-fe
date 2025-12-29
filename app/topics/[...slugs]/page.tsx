import type { Metadata } from "next";
import { AllCoursesPage } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

interface SlugPageProps {
  params: Promise<{
    slugs: string[];
  }>;
}

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slugs } = await params;
  
  // Create title from slugs
  const formatSlug = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Support multiple category slugs
  const formattedSlugs = slugs.map(formatSlug);
  
  const title = slugs.length > 1
    ? `${formattedSlugs.join(", ")} Courses`
    : `${formattedSlugs[0]} Courses`;

  const description = slugs.length > 1
    ? `Browse courses in ${formattedSlugs.join(", ")}. Filter by skill level, duration, and rating to find the perfect course.`
    : `Browse all ${formattedSlugs[0]} courses. Filter by skill level, duration, and rating to find the perfect course.`;

  const canonicalUrl = `${SITE_BASE_URL}/topics/${slugs.join("/")}`;

  return {
    title,
    description,
    keywords: [
      ...formattedSlugs,
      "courses",
      "online learning",
      "skill development",
      "professional courses",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} - Eduta`,
      description,
      url: canonicalUrl,
      siteName: "Eduta",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_BASE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Eduta`,
      description,
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
}

export default async function CategorySlugPage({ params }: SlugPageProps) {
  const { slugs } = await params;
  
  // Pass slugs as props to AllCoursesPage
  return <AllCoursesPage slugs={slugs} />;
}

