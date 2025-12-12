import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs)",
  description:
    "Find answers to common questions about Eduta. Learn about account creation, course enrollment, payments, instructor information, technical support, and more. Get help with your questions.",
  keywords: [
    "eduta faq",
    "frequently asked questions",
    "help center",
    "course enrollment",
    "payment questions",
    "instructor faq",
    "technical support",
    "account help",
  ],
  alternates: {
    canonical: `${SITE_BASE_URL}/faqs`,
  },
  openGraph: {
    title: "Eduta FAQs - Frequently Asked Questions",
    description:
      "Find answers to common questions about Eduta. Learn about account creation, course enrollment, payments, and more.",
    url: `${SITE_BASE_URL}/faqs`,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Eduta FAQs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduta FAQs - Frequently Asked Questions",
    description: "Find answers to common questions about Eduta.",
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

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

