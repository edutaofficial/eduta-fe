"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, EyeIcon, ArrowLeft, TagIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBlogBySlug } from "@/app/api/blog/getBlogBySlug";

interface BlogDetailPageProps {
  slug: string;
}

// Format date to readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate reading time (words per minute)
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export function BlogDetailPage({ slug }: BlogDetailPageProps) {
  const router = useRouter();

  // Fetch blog post
  const {
    data: blogData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getBlogBySlug(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const post = blogData?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-default-200 rounded w-1/4" />
          <div className="h-12 bg-default-200 rounded w-3/4" />
          <div className="h-64 bg-default-200 rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-default-200 rounded" />
            <div className="h-4 bg-default-200 rounded" />
            <div className="h-4 bg-default-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h2 className="text-2xl font-bold text-default-900 mb-4">
          Blog Post Not Found
        </h2>
        <p className="text-default-600 mb-6">
          The blog post you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button onClick={() => router.push("/blog")} variant="outline">
          <ArrowLeft className="size-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        onClick={() => router.push("/blog")}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Blog
      </Button>

      {/* Category Badge */}
      {post.category && (
        <Badge variant="secondary" className="mb-4">
          {post.category.name}
        </Badge>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-default-900 mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-xl text-default-600 mb-6 leading-relaxed">
        {post.excerpt}
      </p>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-default-500 mb-8">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-4" />
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <EyeIcon className="size-4" />
          <span>{post.viewsCount.toLocaleString()} views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span>{readingTime}</span>
        </div>
      </div>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="relative w-full aspect-21/9 rounded-lg overflow-hidden mb-8">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized={
              post.featuredImageUrl.includes("placehold.co") ||
              post.featuredImageUrl.includes("pravatar")
            }
          />
        </div>
      )}

      <Separator className="mb-8" />

      {/* Blog Content - HTML rendered */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <Separator className="my-8" />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-default-900 mb-3 flex items-center gap-2">
            <TagIcon className="size-5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag.tagId}
                variant="secondary"
                className="cursor-pointer hover:bg-default-100 transition-colors border border-default-300"
                onClick={() => router.push(`/blog?tag=${tag.tagName}`)}
              >
                {tag.tagName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Meta Info Footer */}
      {(post.metaTitle || post.metaDescription) && (
        <div className="mt-8 p-4 bg-default-50 rounded-lg border border-default-200">
          <p className="text-xs text-default-500">
            Last updated: {formatDate(post.updatedAt || post.publishedAt)}
          </p>
        </div>
      )}
    </article>
  );
}
