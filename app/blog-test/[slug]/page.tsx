"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarIcon, EyeIcon, ArrowLeft, TagIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BlogPostDetail } from "@/types/blog";

// Dummy blog post data
const dummyBlogPosts: Record<string, BlogPostDetail> = {
  "getting-started-nextjs-14": {
    blogId: "1",
    title: "Getting Started with Next.js 14 and App Router",
    slug: "getting-started-nextjs-14",
    excerpt:
      "Learn how to build modern web applications with Next.js 14's powerful App Router and Server Components.",
    content: `
      <h2>Introduction to Next.js 14</h2>
      <p>Next.js 14 introduces groundbreaking features that revolutionize how we build web applications. The new App Router brings a paradigm shift in routing and data fetching, making your applications faster and more efficient.</p>
      
      <h2>What's New in Next.js 14?</h2>
      <p>The latest version of Next.js comes with several exciting features:</p>
      <ul>
        <li><strong>Server Components by default</strong> - Better performance with less JavaScript</li>
        <li><strong>Improved Image Optimization</strong> - Faster page loads with automatic image optimization</li>
        <li><strong>Enhanced Metadata API</strong> - Better SEO with improved metadata handling</li>
        <li><strong>Turbopack</strong> - Lightning-fast bundler (still in beta)</li>
      </ul>

      <h2>Getting Started</h2>
      <p>To create a new Next.js 14 project, simply run:</p>
      <pre><code>npx create-next-app@latest my-app</code></pre>
      
      <h3>Project Structure</h3>
      <p>The new App Router uses a file-system based routing with a new folder structure:</p>
      <pre><code>app/
  ├── layout.tsx      # Root layout
  ├── page.tsx        # Home page
  └── about/
      └── page.tsx    # About page</code></pre>

      <h2>Server Components</h2>
      <p>One of the most powerful features is React Server Components. By default, all components in the app directory are Server Components:</p>
      <pre><code>// This is a Server Component by default
export default function Page() {
  return &lt;h1&gt;Hello from Server!&lt;/h1&gt;
}</code></pre>

      <blockquote>
        <p>"Server Components allow you to write UI that can be rendered and optionally cached on the server. In Next.js, the rendering work is split by route segments to enable streaming and partial rendering."</p>
      </blockquote>

      <h2>Data Fetching</h2>
      <p>Data fetching is simplified with async/await directly in Server Components:</p>
      <pre><code>async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return &lt;main&gt;{/* Use data here */}&lt;/main&gt;
}</code></pre>

      <h2>Client Components</h2>
      <p>When you need interactivity, you can use Client Components by adding the <code>"use client"</code> directive:</p>
      <pre><code>"use client"

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return &lt;button onClick={() => setCount(count + 1)}&gt;{count}&lt;/button&gt;
}</code></pre>

      <h2>Conclusion</h2>
      <p>Next.js 14 with the App Router is a game-changer for modern web development. It combines the best of server-side and client-side rendering, giving you the tools to build fast, scalable applications with an amazing developer experience.</p>
      
      <p>Start exploring Next.js 14 today and experience the future of web development!</p>
    `,
    featuredImageId: 1,
    featuredImageUrl:
      "https://placehold.co/800x450/3b82f6/ffffff?text=Next.js+14",
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
    metaTitle: "Getting Started with Next.js 14 - Complete Guide",
    metaDescription:
      "Learn how to build modern web applications with Next.js 14's App Router and Server Components in this comprehensive guide.",
    publishedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-16T15:30:00Z",
  },
  "mastering-typescript-advanced-types": {
    blogId: "2",
    title: "Mastering TypeScript: Advanced Types and Patterns",
    slug: "mastering-typescript-advanced-types",
    excerpt:
      "Dive deep into TypeScript's advanced type system and learn powerful patterns for building type-safe applications.",
    content: `
      <h2>Understanding Advanced TypeScript</h2>
      <p>TypeScript's type system is incredibly powerful, going far beyond basic type annotations. Let's explore some advanced concepts that will take your TypeScript skills to the next level.</p>

      <h2>1. Utility Types</h2>
      <p>TypeScript provides several built-in utility types that make common type transformations easier:</p>
      
      <h3>Partial&lt;T&gt;</h3>
      <p>Makes all properties optional:</p>
      <pre><code>interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial&lt;User&gt;;
// { id?: number; name?: string; email?: string; }</code></pre>

      <h3>Required&lt;T&gt;</h3>
      <p>Makes all properties required:</p>
      <pre><code>type RequiredUser = Required&lt;PartialUser&gt;;
// Back to: { id: number; name: string; email: string; }</code></pre>

      <h2>2. Conditional Types</h2>
      <p>Conditional types allow you to create types that depend on other types:</p>
      <pre><code>type IsString&lt;T&gt; = T extends string ? true : false;

type A = IsString&lt;string&gt;;  // true
type B = IsString&lt;number&gt;;  // false</code></pre>

      <h2>3. Mapped Types</h2>
      <p>Create new types by transforming existing ones:</p>
      <pre><code>type Readonly&lt;T&gt; = {
  readonly [P in keyof T]: T[P];
};

type ReadonlyUser = Readonly&lt;User&gt;;</code></pre>

      <h2>4. Template Literal Types</h2>
      <p>Build types from string literals:</p>
      <pre><code>type Color = "red" | "green" | "blue";
type Brightness = "light" | "dark";

type Theme = \`\${Brightness}-\${Color}\`;
// "light-red" | "light-green" | "light-blue" | "dark-red" | ...</code></pre>

      <h2>5. Discriminated Unions</h2>
      <p>Create type-safe unions with a discriminant property:</p>
      <pre><code>type Success = { status: "success"; data: any };
type Error = { status: "error"; error: string };
type Result = Success | Error;

function handleResult(result: Result) {
  if (result.status === "success") {
    // TypeScript knows result is Success here
    console.log(result.data);
  } else {
    // TypeScript knows result is Error here
    console.log(result.error);
  }
}</code></pre>

      <blockquote>
        <p>"TypeScript's type system is Turing complete, which means you can express any computation in the type system itself!"</p>
      </blockquote>

      <h2>Best Practices</h2>
      <ul>
        <li>Use <code>unknown</code> instead of <code>any</code> when possible</li>
        <li>Leverage type inference - don't over-annotate</li>
        <li>Use discriminated unions for state management</li>
        <li>Create reusable utility types for your domain</li>
        <li>Enable strict mode in tsconfig.json</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Mastering TypeScript's advanced types will help you write more maintainable, type-safe code. These patterns might seem complex at first, but they become invaluable as your codebase grows.</p>
    `,
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
    metaTitle: "Mastering TypeScript Advanced Types - Complete Guide",
    metaDescription:
      "Learn advanced TypeScript types and patterns including utility types, conditional types, mapped types, and more.",
    publishedAt: "2024-01-20T14:30:00Z",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-21T09:15:00Z",
  },
  // Default post for any other slug
  default: {
    blogId: "999",
    title: "Sample Blog Post",
    slug: "sample-post",
    excerpt:
      "This is a sample blog post with dummy content for testing purposes.",
    content: `
      <h2>Welcome to Our Blog!</h2>
      <p>This is a test blog post created to demonstrate the blog detail page functionality with dummy data.</p>

      <h2>Features of This Blog System</h2>
      <ul>
        <li><strong>Responsive Design</strong> - Works beautifully on all devices</li>
        <li><strong>Rich Content</strong> - Supports HTML content with proper styling</li>
        <li><strong>Tags and Categories</strong> - Organize content effectively</li>
        <li><strong>Reading Time</strong> - Estimate how long it takes to read</li>
        <li><strong>View Counter</strong> - Track article popularity</li>
      </ul>

      <h2>Sample Code Block</h2>
      <pre><code>function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));</code></pre>

      <blockquote>
        <p>"This is a sample quote to demonstrate blockquote styling in the blog post."</p>
      </blockquote>

      <h2>Sample Image</h2>
      <p>Images can be embedded in the HTML content and will be properly styled.</p>

      <h3>Lists and Formatting</h3>
      <p>The blog supports various formatting options:</p>
      <ol>
        <li>Ordered lists like this one</li>
        <li><strong>Bold text</strong> and <em>italic text</em></li>
        <li><code>Inline code</code> formatting</li>
        <li>And much more!</li>
      </ol>

      <h2>Conclusion</h2>
      <p>This is a fully functional blog system ready for your content. The admin panel will allow you to create rich, engaging blog posts with all the formatting options you need.</p>
    `,
    featuredImageId: 999,
    featuredImageUrl:
      "https://placehold.co/800x450/6366f1/ffffff?text=Blog+Post",
    category: {
      categoryId: "cat-999",
      name: "General",
      slug: "general",
    },
    isFeatured: false,
    viewsCount: 42,
    tags: [
      { tagId: "tag-999", tagName: "Demo" },
      { tagId: "tag-998", tagName: "Test" },
    ],
    metaTitle: "Sample Blog Post - Test Data",
    metaDescription: "A sample blog post for testing the blog detail page.",
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Format date to readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate reading time
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, "");
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export default function BlogTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Get dummy post or default
  const post = dummyBlogPosts[slug] || dummyBlogPosts.default;
  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Test Mode Badge */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
          🧪 Test Mode - Dummy Data
        </span>
      </div>

      {/* Back Button */}
      <Button
        onClick={() => router.push("/blog-test")}
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
            unoptimized
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
                className="border border-default-300"
              >
                {tag.tagName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Test Mode Info */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📝 Test Route Information
        </h3>
        <p className="text-blue-800 mb-2">
          This is a test route displaying dummy blog content for demonstration.
        </p>
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> The HTML content is rendered using{" "}
          <code className="bg-blue-100 px-1.5 py-0.5 rounded">
            dangerouslySetInnerHTML
          </code>{" "}
          and styled with Tailwind&apos;s typography plugin.
        </p>
      </div>
    </article>
  );
}
