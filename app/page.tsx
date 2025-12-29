import type { Metadata } from "next";
import {
  ExploreCourses,
  Hero,
  Categories,
  FeaturedCourses,
  Testimonials,
  FAQ as FAQComponent,
} from "@/components/Home";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover world-class online courses, expert instructors, and flexible learning paths. Transform your skills and advance your career with Eduta's comprehensive e-learning platform.",
  keywords: [
    "online courses",
    "e-learning",
    "education platform",
    "skill development",
    "online learning",
    "professional development",
    "certification courses",
    "learn online",
    "online education",
  ],
  alternates: {
    canonical: SITE_BASE_URL,
  },
  openGraph: {
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta's comprehensive e-learning platform.",
    url: SITE_BASE_URL,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Eduta - Online Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta.",
    creator: "@eduta",
    images: [`${SITE_BASE_URL}/og-image.jpg`],
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

export default function Page() {
  const data = {
    heroSlides: [
      {
        id: 1,
        title: "Become a Future-Ready Business Leader",
        subtitle:
          "Master strategy, decision-making, and leadership skills trusted by global organizations.",
        highlights: [
          "Learn directly from industry experts",
          "Real-world case studies & practical assignments",
          "Build job-ready skills in Business Analysis, Strategy & Intelligence",
        ],
        image: "/leader-authority-boss-coach-director-manager-concept-min.webp",
        buttonText: "Start Learning Free",
        studentStats: {
          students: [
            { id: 1, name: "Ahmed", image: "https://i.pravatar.cc/150?img=12" },
            { id: 2, name: "Fatima", image: "https://i.pravatar.cc/150?img=5" },
            { id: 3, name: "John", image: "https://i.pravatar.cc/150?img=7" },
          ],
          learnerCount: "10,000+",
        },
      },
      {
        id: 2,
        title: "Unlock Your Personal & Professional Potential",
        subtitle:
          "Boost productivity, confidence, and communication to achieve success in every area of life.",
        highlights: [
          "Courses on Personal Productivity, Confidence, Body Language",
          "Guided exercises and expert mentorship",
          "Transform your mindset with proven frameworks",
        ],
        image: "/improvement-summary-personal-development-workflow-min.webp",
        buttonText: "Begin Your Transformation",
        studentStats: {
          students: [
            { id: 1, name: "Sara", image: "https://i.pravatar.cc/150?img=10" },
            { id: 2, name: "Ali", image: "https://i.pravatar.cc/150?img=8" },
            { id: 3, name: "Emma", image: "https://i.pravatar.cc/150?img=9" },
          ],
          learnerCount: "5,000+",
        },
      },
      {
        id: 3,
        title: "Accelerate Your Career With Job-Ready Skills",
        subtitle:
          "Master resume writing, job interview skills, and career development strategies to stand out.",
        highlights: [
          "Learn practical tools for career success",
          "Step-by-step interview preparation",
          "Real templates used by HR professionals",
        ],
        image: "/businesswoman-moving-down-staircase-front-building-min.webp",
        buttonText: "Advance Your Career",
        studentStats: {
          students: [
            { id: 1, name: "Omar", image: "https://i.pravatar.cc/150?img=13" },
            {
              id: 2,
              name: "Ayesha",
              image: "https://i.pravatar.cc/150?img=16",
            },
            {
              id: 3,
              name: "Daniel",
              image: "https://i.pravatar.cc/150?img=14",
            },
          ],
          learnerCount: "8,500+",
        },
      },
    ],
  };

  return (
    <>
      <Hero slides={data.heroSlides} />
      <Categories />
      <FeaturedCourses />
      <ExploreCourses />
      <Testimonials />
      <FAQComponent />
    </>
  );
}
