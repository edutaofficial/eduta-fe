import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eduta - Learn, Grow, Succeed",
    template: "%s | Eduta",
  },
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
  ],
  authors: [{ name: "Eduta" }],
  creator: "Eduta",
  publisher: "Eduta",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://eduta.org"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta's comprehensive e-learning platform.",
    url: "https://eduta.org", // Replace with your actual domain
    siteName: "Eduta",
    images: [
      {
        url: "/og-image.png", // Add your OG image
        width: 1200,
        height: 630,
        alt: "Eduta - Online Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta.",
    images: ["/twitter-image.png"], // Add your Twitter card image
    creator: "@eduta", // Replace with your Twitter handle
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
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header loggedIn={true} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
