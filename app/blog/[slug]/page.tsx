import type { Metadata } from "next";
import { BlogDetailPage } from "@/components/Blog";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";
import { getBlogBySlug } from "@/app/api/blog/getBlogBySlug";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every 15 minutes
export const revalidate = 900;

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  try {
    // Fetch all blog posts to generate static pages
    // Use a smaller pageSize to avoid 422 errors
    const blogsData = await getAllBlogs({ pageSize: 50, page: 1 });
    
    // Safeguard: Check if blogsData exists and has the expected structure
    if (!blogsData || !blogsData.data || !Array.isArray(blogsData.data.posts)) {
      // eslint-disable-next-line no-console
      console.warn("Blog data structure is invalid, generating on-demand");
      return [];
    }

    const { posts } = blogsData.data;

    // Return empty array if no posts
    if (posts.length === 0) {
      // eslint-disable-next-line no-console
      console.log("No blog posts found for static generation");
      return [];
    }

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    // If fetching fails, return empty array - pages will be generated on-demand
    // eslint-disable-next-line no-console
    console.error("Error generating static params for blog posts:", error);
    // Log more details for debugging
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("Error details:", error.message);
    }
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blogData = await getBlogBySlug(slug);
    const post = blogData?.data;

    if (!post) {
      return {
        title: "Blog Post Not Found",
        description: "The blog post you're looking for doesn't exist.",
      };
    }

    const url = `${SITE_BASE_URL}/blog/${slug}`;
    const imageUrl = post.featuredImageUrl || `${SITE_BASE_URL}/og-image.jpg`;

    // Generate structured data for article rich snippets
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: imageUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: "Eduta",
        url: SITE_BASE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Eduta",
        url: SITE_BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_BASE_URL}/logo-main.webp`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      keywords: post.tags.map((tag) => tag.tagName).join(", "),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_BASE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    };

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      keywords: post.tags.map((tag) => tag.tagName),
      authors: [{ name: "Eduta" }],
      creator: "Eduta",
      publisher: "Eduta",
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        url,
        siteName: "Eduta",
        locale: "en_US",
        type: "article",
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: ["Eduta"],
        section: post.category?.name || "Education",
        tags: post.tags.map((tag) => tag.tagName),
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        creator: "@eduta",
        images: [imageUrl],
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
      other: {
        "article:published_time": post.publishedAt,
        "article:modified_time": post.updatedAt,
        "article:author": "Eduta",
        "article:section": post.category?.name || "Education",
        // Add structured data as JSON-LD
        "application-ld+json": JSON.stringify([articleSchema, breadcrumbSchema]),
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating metadata for blog post:", error);
    return {
      title: "Blog Post",
      description: "Read our latest blog post on Eduta.",
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailPage slug={slug} />;
}
