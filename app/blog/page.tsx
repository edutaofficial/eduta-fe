import type { Metadata } from "next";
import { BlogListingPage } from "@/components/Blog";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Explore our blog for the latest insights, tips, and guides on online learning, skill development, career growth, and educational trends. Stay updated with expert advice and industry news.",
  keywords: [
    "education blog",
    "online learning tips",
    "career advice",
    "skill development",
    "learning resources",
    "educational insights",
    "professional growth",
  ],
  alternates: {
    canonical: `${SITE_BASE_URL}/blog`,
  },
  openGraph: {
    title: "Eduta Blog - Insights, Tips & Guides",
    description:
      "Explore our blog for the latest insights, tips, and guides on online learning, skill development, and career growth.",
    url: `${SITE_BASE_URL}/blog`,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Eduta Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduta Blog - Insights & Guides",
    description:
      "Explore our blog for the latest insights on online learning and skill development.",
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

export default function BlogPage() {
  return <BlogListingPage />;
}
