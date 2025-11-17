import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/student/", "/instructor/"],
      },
    ],
    sitemap: "https://eduta.org/sitemap.xml", // Replace with your actual domain
  };
}

