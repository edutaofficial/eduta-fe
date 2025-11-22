"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavMenuContentModified } from "@/components/ui/nav-menu-content-modified";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";

interface BlogDropdownProps {
  blogTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function BlogDropdown({ blogTriggerRef }: BlogDropdownProps) {
  // Fetch top 3 blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["header-blogs"],
    queryFn: () => getAllBlogs({ pageSize: 3, page: 1 }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const blogs = blogsData?.data?.posts || [];
  const hasBlogs = blogs.length > 0;

  // If no blogs, just show a simple link
  if (!hasBlogs && !isLoading) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
          <Link href="/blog">Blog</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  // Show dropdown with top blogs
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger ref={blogTriggerRef}>Blog</NavigationMenuTrigger>
      <NavMenuContentModified triggerRef={blogTriggerRef}>
        <ul className="grid gap-2 md:w-[25rem] lg:w-[31.25rem] lg:grid-cols-[.75fr_1fr]">
          {isLoading ? (
            // Loading skeleton
            <>
              <li className="row-span-3 p-4">
                <div className="h-full w-full rounded-md bg-default-200 animate-pulse" />
              </li>
              {[...Array(2)].map((_, i) => (
                <li key={i} className="p-4">
                  <div className="h-4 w-32 bg-default-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-full bg-default-200 animate-pulse rounded" />
                </li>
              ))}
            </>
          ) : (
            <>
              {/* Featured Blog (First) */}
              {blogs[0] && (
                <li className="row-span-3 p-4">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full flex-col justify-end rounded-md bg-cover bg-center p-6 no-underline outline-hidden select-none focus:shadow-md relative overflow-hidden"
                      href={`/blog/${blogs[0].slug}`}
                    >
                      {/* Background Image with Overlay */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${
                            blogs[0].featuredImageUrl ||
                            "https://placehold.co/400x400/e5e7eb/666666?text=Blog"
                          })`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />

                      {/* Content */}
                      <div className="relative z-10 text-white">
                        <div className="mt-4 mb-2 text-lg font-medium line-clamp-2">
                          {blogs[0].title}
                        </div>
                        <p className="text-sm leading-tight line-clamp-3 opacity-90">
                          {blogs[0].excerpt}
                        </p>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              )}

              {/* Other Blogs */}
              {blogs.slice(1).map((blog) => (
                <ListItem
                  key={blog.blogId}
                  href={`/blog/${blog.slug}`}
                  title={blog.title}
                >
                  {blog.excerpt}
                </ListItem>
              ))}

              {/* View All Link */}
              <li className="col-span-full">
                <NavigationMenuLink asChild>
                  <Link
                    href="/blog"
                    className="block select-none rounded-md p-4 text-center leading-none no-underline outline-hidden transition-colors hover:bg-primary-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-semibold text-primary-600">
                      View All Blog Posts →
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </>
          )}
        </ul>
      </NavMenuContentModified>
    </NavigationMenuItem>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-4 leading-none no-underline outline-hidden transition-colors hover:bg-primary-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm leading-none font-medium line-clamp-1">
            {title}
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

