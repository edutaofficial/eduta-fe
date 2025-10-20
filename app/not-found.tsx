"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  SearchIcon,
  HomeIcon,
  ArrowLeftIcon,
  CompassIcon,
  BookOpenIcon,
  HelpCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const popularPages = [
    { name: "Browse Courses", href: "/courses", icon: BookOpenIcon },
    { name: "Explore Categories", href: "/categories", icon: CompassIcon },
    { name: "Help Center", href: "/help", icon: HelpCircleIcon },
  ];

  return (
    <div className="flex mt-20 items-center justify-center p-4  animate-in fade-in-0 duration-700">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-72 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 size-96 bg-secondary-200 rounded-full blur-3xl opacity-20 animate-pulse delay-700" />
      </div>

      <Empty className="max-w-2xl border-primary-200 bg-white/90 backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 animate-pulse" />

        <EmptyHeader>
          {/* Logo */}
          <EmptyMedia variant="default">
            <Link
              href="/"
              className="animate-in zoom-in-95 fade-in-0 duration-500 inline-block transition-transform hover:scale-105"
            >
              <Image
                src="/logo-main.webp"
                alt="Eduta Logo"
                width={100}
                height={32}
                priority
                className="mb-1"
              />
            </Link>
          </EmptyMedia>

          {/* 404 Number */}
          <div className="relative mb-3 animate-in zoom-in-90 fade-in-0 duration-500 delay-150">
            <h1 className="text-8xl font-bold bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          <EmptyTitle className="text-3xl text-primary-900 animate-in slide-in-from-top-5 fade-in-0 duration-500 delay-200">
            Page Not Found
          </EmptyTitle>

          <EmptyDescription className="animate-in slide-in-from-bottom-5 fade-in-0 duration-500 delay-300">
            Oops! The page you&apos;re looking for seems to have wandered off.
            It might have been moved, deleted, or perhaps it never existed in
            the first place.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="animate-in fade-in-0 duration-500 delay-400">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/">
                <HomeIcon className="size-4" />
                Back to Home
              </Link>
            </Button>
            {mounted && (
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="lg"
                className="gap-2 border-primary-300 hover:bg-primary-50 transition-all"
              >
                <ArrowLeftIcon className="size-4" />
                Go Back
              </Button>
            )}
          </div>

          {/* Quick Search */}
          <div className="w-full mt-6">
            <p className="text-sm text-muted-foreground mb-2">
              Looking for something specific?
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-primary-100 to-secondary-100 hover:from-primary-200 hover:to-secondary-200 transition-all"
            >
              <Link href="/">
                <SearchIcon className="size-4" />
                Search Courses
              </Link>
            </Button>
          </div>

          {/* Popular Pages Collapsible */}
          <div className="w-full mt-6">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <CompassIcon className="size-4" />
              <span>Popular Pages</span>
              <ArrowLeftIcon
                className={cn(
                  "size-4 transition-transform duration-300 -rotate-90",
                  showSuggestions && "rotate-90"
                )}
              />
            </button>

            {/* Suggestions Panel */}
            <div
              className={cn(
                "mt-4 overflow-hidden transition-all duration-500 ease-in-out",
                showSuggestions ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
                <div className="grid gap-2">
                  {popularPages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-all group"
                    >
                      <div className="size-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <page.icon className="size-5" />
                      </div>
                      <span className="text-sm font-medium text-primary-900">
                        {page.name}
                      </span>
                      <ArrowLeftIcon className="size-4 text-primary-400 ml-auto -rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="w-full mt-6 pt-6 border-t border-primary-200/50">
            <p className="text-sm text-muted-foreground mb-2">
              Still can&apos;t find what you&apos;re looking for?
            </p>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full gap-2 hover:bg-primary-50 transition-all"
            >
              <Link href="/#">
                <HelpCircleIcon className="size-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </EmptyContent>

        {/* Footer */}
        <div className="mt-6 animate-in fade-in-0 duration-700 delay-700">
          <p className="text-xs text-muted-foreground">
            Need help navigating? We&apos;re here to assist you.
          </p>
        </div>
      </Empty>
    </div>
  );
}
