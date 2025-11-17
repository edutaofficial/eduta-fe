"use client";

import * as React from "react";
import { BlogCard } from "@/components/Blog";
import type { BlogPost } from "@/types/blog";

// Dummy data for testing
const dummyPosts: BlogPost[] = [
  {
    blogId: "1",
    title: "Getting Started with Next.js 14 and App Router",
    slug: "getting-started-nextjs-14",
    excerpt:
      "Learn how to build modern web applications with Next.js 14's powerful App Router and Server Components.",
    featuredImageId: 1,
    featuredImageUrl: "https://placehold.co/800x450/3b82f6/ffffff?text=Next.js+14",
    category: {
      categoryId: "cat-1",
      name: "Web Development",
      slug: "web-development",
    },
    isFeatured: true,
    viewsCount: 1523,
    tags: [
      { tagId: "tag-1", tagName: "Next.js" },
      { tagId: "tag-2", tagName: "React" },
      { tagId: "tag-3", tagName: "JavaScript" },
    ],
    publishedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    blogId: "2",
    title: "Mastering TypeScript: Advanced Types and Patterns",
    slug: "mastering-typescript-advanced-types",
    excerpt:
      "Dive deep into TypeScript's advanced type system and learn powerful patterns for building type-safe applications.",
    featuredImageId: 2,
    featuredImageUrl:
      "https://placehold.co/800x450/8b5cf6/ffffff?text=TypeScript",
    category: {
      categoryId: "cat-2",
      name: "Programming",
      slug: "programming",
    },
    isFeatured: true,
    viewsCount: 2341,
    tags: [
      { tagId: "tag-4", tagName: "TypeScript" },
      { tagId: "tag-5", tagName: "Programming" },
      { tagId: "tag-6", tagName: "Types" },
    ],
    publishedAt: "2024-01-20T14:30:00Z",
    createdAt: "2024-01-20T14:30:00Z",
  },
  {
    blogId: "3",
    title: "Building Responsive UIs with Tailwind CSS",
    slug: "building-responsive-uis-tailwind",
    excerpt:
      "Discover best practices for creating beautiful, responsive user interfaces using Tailwind CSS utility classes.",
    featuredImageId: 3,
    featuredImageUrl:
      "https://placehold.co/800x450/06b6d4/ffffff?text=Tailwind+CSS",
    category: {
      categoryId: "cat-3",
      name: "Design",
      slug: "design",
    },
    isFeatured: false,
    viewsCount: 987,
    tags: [
      { tagId: "tag-7", tagName: "Tailwind" },
      { tagId: "tag-8", tagName: "CSS" },
      { tagId: "tag-9", tagName: "Design" },
    ],
    publishedAt: "2024-01-25T09:15:00Z",
    createdAt: "2024-01-25T09:15:00Z",
  },
  {
    blogId: "4",
    title: "State Management in React: Zustand vs Redux",
    slug: "state-management-react-zustand-redux",
    excerpt:
      "Compare popular state management solutions for React applications and learn when to use each one.",
    featuredImageId: 4,
    featuredImageUrl:
      "https://placehold.co/800x450/ec4899/ffffff?text=State+Management",
    category: {
      categoryId: "cat-1",
      name: "Web Development",
      slug: "web-development",
    },
    isFeatured: false,
    viewsCount: 1756,
    tags: [
      { tagId: "tag-2", tagName: "React" },
      { tagId: "tag-10", tagName: "State Management" },
      { tagId: "tag-11", tagName: "Zustand" },
    ],
    publishedAt: "2024-02-01T11:45:00Z",
    createdAt: "2024-02-01T11:45:00Z",
  },
  {
    blogId: "5",
    title: "API Design Best Practices: REST vs GraphQL",
    slug: "api-design-rest-vs-graphql",
    excerpt:
      "Learn the fundamentals of API design and understand when to choose REST or GraphQL for your project.",
    featuredImageId: 5,
    featuredImageUrl:
      "https://placehold.co/800x450/10b981/ffffff?text=API+Design",
    category: {
      categoryId: "cat-4",
      name: "Backend",
      slug: "backend",
    },
    isFeatured: true,
    viewsCount: 3201,
    tags: [
      { tagId: "tag-12", tagName: "API" },
      { tagId: "tag-13", tagName: "REST" },
      { tagId: "tag-14", tagName: "GraphQL" },
    ],
    publishedAt: "2024-02-05T16:20:00Z",
    createdAt: "2024-02-05T16:20:00Z",
  },
  {
    blogId: "6",
    title: "Introduction to Server-Side Rendering with Next.js",
    slug: "intro-server-side-rendering-nextjs",
    excerpt:
      "Understand the benefits of Server-Side Rendering and how to implement it effectively in your Next.js applications.",
    featuredImageId: 6,
    featuredImageUrl: "https://placehold.co/800x450/f59e0b/ffffff?text=SSR",
    category: {
      categoryId: "cat-1",
      name: "Web Development",
      slug: "web-development",
    },
    isFeatured: false,
    viewsCount: 1432,
    tags: [
      { tagId: "tag-1", tagName: "Next.js" },
      { tagId: "tag-15", tagName: "SSR" },
      { tagId: "tag-16", tagName: "Performance" },
    ],
    publishedAt: "2024-02-10T13:00:00Z",
    createdAt: "2024-02-10T13:00:00Z",
  },
];

export default function BlogTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-4">
          🧪 Test Mode - Dummy Data
        </div>
        <h1 className="text-4xl font-bold text-default-900 mb-2">Blog</h1>
        <p className="text-lg text-default-600">
          Discover articles, tutorials, and insights (Demo with dummy data)
        </p>
      </div>

      {/* Featured Posts */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-default-900 mb-6">
          Featured Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPosts
            .filter((post) => post.isFeatured)
            .map((post) => (
              <BlogCard key={post.blogId} {...post} />
            ))}
        </div>
      </div>

      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold text-default-900 mb-6">
          All Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPosts.map((post) => (
            <BlogCard key={post.blogId} {...post} />
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📝 Test Route Information
        </h3>
        <p className="text-blue-800 mb-2">
          This is a test route displaying dummy blog data for demonstration
          purposes.
        </p>
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Click on any blog card to see the detail page
          with dummy content.
        </p>
      </div>
    </div>
  );
}

