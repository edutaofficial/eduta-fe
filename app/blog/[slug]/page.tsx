import type { Metadata } from "next";
import { BlogDetailPage } from "@/components/Blog";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";
import { getBlogBySlug } from "@/app/api/blog/getBlogBySlug";
import { SITE_BASE_URL } from "@/lib/constants";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  try {
    // Fetch all blog posts to generate static pages
    // Use a large pageSize to get all posts
    const blogsData = await getAllBlogs({ pageSize: 100, page: 1 });
    const posts = blogsData?.data?.posts || [];

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    // If fetching fails, return empty array - pages will be generated on-demand
    // eslint-disable-next-line no-console
    console.error("Error generating static params for blog posts:", error);
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
