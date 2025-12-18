"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MenuIcon, BookOpenIcon, LayoutGridIcon, InfoIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllBlogs } from "@/app/api/blog/getAllBlogs";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const { categories, loading: categoriesLoading, fetchCategories } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Fetch top 3 blogs
  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ["mobile-menu-blogs"],
    queryFn: () => getAllBlogs({ pageSize: 3, page: 1 }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const blogs = blogsData?.data?.posts || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="size-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        {/* Main Navigation Links */}
        <nav className="flex flex-col gap-2 p-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <LayoutGridIcon className="size-5" />
            Explore
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <InfoIcon className="size-5" />
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <InfoIcon className="size-5" />
            Contact Us
          </Link>
          <Link
            href="/faqs"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <InfoIcon className="size-5" />
            FAQs
          </Link>
        </nav>

        <Separator className="my-4" />

        {/* Blog Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenIcon className="size-5" />
            <h3 className="font-semibold text-sm">Blog</h3>
          </div>
          {blogsLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-md px-3 py-2">
                  <div className="h-4 w-32 bg-default-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-full bg-default-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {blogs.map((blog) => (
                <Link
                  key={blog.blogId}
                  href={`/blog/${blog.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-1">{blog.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {blog.excerpt}
                  </p>
                </Link>
              ))}
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition-colors text-center"
              >
                View All Blog Posts →
              </Link>
            </div>
          ) : (
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              View Blog
            </Link>
          )}
        </div>

        <Separator className="my-4" />

        {/* Categories Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGridIcon className="size-5" />
            <h3 className="font-semibold text-sm">Categories</h3>
          </div>
          {categoriesLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-md px-3 py-2">
                  <div className="h-4 w-32 bg-default-200 animate-pulse rounded mb-2" />
                  <div className="h-3 w-full bg-default-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.categoryId}
                  href={`/topics/${category.slug}/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
                >
                  <p className="text-sm font-medium line-clamp-1">
                    {category.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description || "Explore courses in this category"}
                  </p>
                </Link>
              ))}
              <Link
                href="/topics"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100 transition-colors text-center"
              >
                View All Categories →
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
