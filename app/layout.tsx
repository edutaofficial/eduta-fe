import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { AuthProvider } from "@/lib/context/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import { TokenRefreshProvider } from "@/components/providers/TokenRefreshProvider";
import { ToastProvider } from "@/components/ui/toast";
import { SITE_BASE_URL } from "@/lib/constants";

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
  metadataBase: new URL(SITE_BASE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta's comprehensive e-learning platform.",
    url: SITE_BASE_URL,
    siteName: "Eduta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduta - Learn, Grow, Succeed",
    description:
      "Discover world-class online courses and expert instructors. Transform your skills with Eduta.",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eduta",
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
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <NextAuthSessionProvider>
            <TokenRefreshProvider>
              <ToastProvider>
                <main>
                  <AuthProvider>
                    <ClientLayout>{children}</ClientLayout>
                  </AuthProvider>
                </main>
              </ToastProvider>
            </TokenRefreshProvider>
          </NextAuthSessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
