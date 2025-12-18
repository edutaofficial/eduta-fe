import type { Metadata } from "next";
import { AllCoursesPage } from "@/components/Courses";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

interface SlugPageProps {
  params: Promise<{
    slugs: string[];
  }>;
}

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slugs } = await params;
  const categorySlug = slugs[0] || "";
  const subcategorySlug = slugs[1] || "";

  // Create title from slugs
  const formatSlug = (slug: string) =>
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const title = subcategorySlug
    ? `${formatSlug(subcategorySlug)} Courses`
    : `${formatSlug(categorySlug)} Courses`;

  const description = subcategorySlug
    ? `Browse ${formatSlug(subcategorySlug)} courses in ${formatSlug(categorySlug)}. Filter by skill level, duration, and rating to find the perfect course.`
    : `Browse all ${formatSlug(categorySlug)} courses. Filter by skill level, duration, and rating to find the perfect course.`;

  const canonicalUrl = subcategorySlug
    ? `${SITE_BASE_URL}/topics/${categorySlug}/${subcategorySlug}`
    : `${SITE_BASE_URL}/topics/${categorySlug}/${categorySlug}`;

  return {
    title,
    description,
    keywords: [
      formatSlug(categorySlug),
      subcategorySlug ? formatSlug(subcategorySlug) : "",
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

