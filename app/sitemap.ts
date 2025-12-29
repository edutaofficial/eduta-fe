import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/constants";
import { searchCourses } from "@/app/api/course/searchCourses";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";

/**
 * Dynamic Sitemap Generator
 * Generates a comprehensive sitemap with all static and dynamic routes
 * Updates automatically via ISR (15 minutes revalidation)
 */
export const revalidate = 900; // Revalidate every 15 minutes

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_BASE_URL;
  const currentDate = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/topics`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Fetch dynamic routes
  let courseRoutes: MetadataRoute.Sitemap = [];
  let blogRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    // Fetch all courses for sitemap (max 50 per backend limit)
    const coursesData = await searchCourses({
      pageSize: 50,
      page: 1,
      sortBy: "created_at",
      order: "desc",
    });

    const courses = coursesData?.data?.courses || [];
    courseRoutes = courses.map((course) => ({
      url: `${baseUrl}/course/${course.slug}`,
      lastModified: new Date(course.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Extract unique categories from courses
    const uniqueCategories = new Map<string, { slug: string; name: string }>();
    courses.forEach((course) => {
      if (course.category && course.category.slug) {
        uniqueCategories.set(course.category.slug, {
          slug: course.category.slug,
          name: course.category.name,
        });
      }
    });

    // Add category routes
    categoryRoutes = Array.from(uniqueCategories.values()).map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching courses for sitemap:", error);
  }

  try {
    // Fetch all blog posts for sitemap (max 50 per backend limit)
    const blogsData = await getAllBlogs({ pageSize: 50, page: 1 });
    const posts = blogsData?.data?.posts || [];

    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt || post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching blogs for sitemap:", error);
  }

  // Combine all routes
  return [
    ...staticRoutes,
    ...courseRoutes,
    ...blogRoutes,
    ...categoryRoutes,
  ];
}

