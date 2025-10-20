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
import { CONSTANTS } from "@/lib/constants";

export default function MobileMenu() {
  const [open, setOpen] = React.useState(false);

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
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <InfoIcon className="size-5" />
            About
          </Link>
        </nav>

        <Separator className="my-4" />

        {/* Blog Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpenIcon className="size-5" />
            <h3 className="font-semibold text-sm">Blog</h3>
          </div>
          <div className="flex flex-col gap-2">
            {CONSTANTS.BLOG_POSTS.map((post) => (
              <Link
                key={post.id}
                href={post.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
              >
                <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Categories Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGridIcon className="size-5" />
            <h3 className="font-semibold text-sm">Categories</h3>
          </div>
          <div className="flex flex-col gap-2">
            {CONSTANTS.CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-100 transition-colors"
              >
                <p className="text-sm font-medium line-clamp-1">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
