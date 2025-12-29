import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Eduta. Have questions or feedback? Contact our team through email, phone, or send us a message. We're here to help you on your learning journey.",
  keywords: [
    "contact eduta",
    "customer support",
    "help center",
    "get in touch",
    "support team",
    "contact form",
  ],
  alternates: {
    canonical: `${SITE_BASE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Eduta - We're Here to Help",
    description:
      "Get in touch with Eduta. Have questions or feedback? Contact our team - we're here to help you on your learning journey.",
    url: `${SITE_BASE_URL}/contact`,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Contact Eduta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Eduta - We're Here to Help",
    description: "Get in touch with Eduta. We're here to help you on your learning journey.",
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

