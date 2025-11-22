"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, EyeIcon, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";

// Generate a consistent placeholder color based on blog title
function getPlaceholderColor(title?: string): string {
  const colors = [
    "bg-gradient-to-br from-blue-400 to-blue-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-green-400 to-green-600",
    "bg-gradient-to-br from-yellow-400 to-yellow-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-indigo-400 to-indigo-600",
    "bg-gradient-to-br from-teal-400 to-teal-600",
  ];

  if (!title) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Format date to readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface BlogCardProps extends BlogPost {
  className?: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  featuredImageUrl,
  category,
  isFeatured,
  viewsCount,
  tags,
  publishedAt,
  className,
}: BlogCardProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        "group block rounded-lg bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:scale-[1.02]",
        className
      )}
    >
      {/* Featured Image */}
      <div className="relative aspect-[16/9] w-full bg-default-100">
        {featuredImageUrl && !imageError ? (
          <Image
            src={featuredImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized={
              featuredImageUrl.includes("placehold.co") ||
              featuredImageUrl.includes("pravatar")
            }
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center text-white",
              getPlaceholderColor(title)
            )}
          >
            <span className="text-4xl font-bold opacity-50">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-yellow-500 text-white">Featured</Badge>
          </div>
        )}

        {/* Category Badge */}
        {category && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {category.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-default-800 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-default-600 line-clamp-2">{excerpt}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <div
                key={tag.tagId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-default-100 text-xs text-default-600"
              >
                <TagIcon className="size-3" />
                {tag.tagName}
              </div>
            ))}
            {tags.length > 3 && (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-default-100 text-xs text-default-600">
                +{tags.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-default-200">
          <div className="flex items-center gap-1 text-xs text-default-500">
            <CalendarIcon className="size-3.5" />
            <span>{formatDate(publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-default-500">
            <EyeIcon className="size-3.5" />
            <span>{viewsCount.toLocaleString()} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

