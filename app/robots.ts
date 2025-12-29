import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/constants";

/**
 * Robots.txt Configuration
 * Optimized for SEO - allows search engines to crawl public content
 * while protecting private user areas and API routes
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",           // API routes
          "/student/",       // Student dashboard (private)
          "/instructor/",    // Instructor dashboard (private)
          "/*?*api*",        // URLs with api parameter
          "/*?*token*",      // URLs with token parameter
          "/certificate/verify/*/download", // Certificate downloads (private)
        ],
        crawlDelay: 0,       // Allow immediate crawling
      },
      // Special rules for Google
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/student/",
          "/instructor/",
          "/certificate/verify/*/download",
        ],
      },
      // Special rules for Bing
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/student/",
          "/instructor/",
          "/certificate/verify/*/download",
        ],
      },
      // Block bad bots
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
    host: SITE_BASE_URL,
  };
}
