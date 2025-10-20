"use client";

import * as React from "react";
import Image from "next/image";
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
  AlertTriangleIcon,
  RefreshCcwIcon,
  HomeIcon,
  BugIcon,
  ChevronDownIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      reset();
      setIsResetting(false);
    }, 500);
  };

  React.useEffect(() => {
    // Log error to error reporting service in production
    // In development, errors are logged to console by Next.js
    if (process.env.NODE_ENV === "production") {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-error-50 via-white to-warning-50 animate-in fade-in-0 duration-700">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 size-72 bg-error-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 size-96 bg-warning-200 rounded-full blur-3xl opacity-20 animate-pulse delay-700" />
      </div>

      <Empty className="max-w-2xl border-error-200 bg-white/90 backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error-500 via-warning-500 to-error-500 animate-pulse" />

        <EmptyHeader>
          {/* Logo */}
          <EmptyMedia variant="default">
            <div className="animate-in zoom-in-95 fade-in-0 duration-500">
              <Image
                src="/logo-main.webp"
                alt="Eduta Logo"
                width={100}
                height={32}
                priority
                className="mb-2"
              />
            </div>
          </EmptyMedia>

          {/* Error Icon with Animation */}
          <div className="relative mb-4 animate-in zoom-in-50 fade-in-0 duration-500 delay-100">
            <div className="absolute inset-0 bg-error-200 rounded-full blur-xl opacity-50 animate-ping" />
            <div className="relative bg-error-100 text-error-600 size-20 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangleIcon className="size-10 animate-bounce" />
            </div>
          </div>

          <EmptyTitle className="text-3xl text-error-600 animate-in slide-in-from-top-5 fade-in-0 duration-500 delay-200">
            Oops! Something Went Wrong
          </EmptyTitle>

          <EmptyDescription className="animate-in slide-in-from-bottom-5 fade-in-0 duration-500 delay-300">
            We encountered an unexpected error. Don&apos;t worry, our team has
            been notified and we&apos;re working on it. Please try again or
            return to the homepage.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="animate-in fade-in-0 duration-500 delay-400">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleReset}
              size="lg"
              disabled={isResetting}
              className={cn(
                "gap-2 shadow-md hover:shadow-lg transition-all bg-error-600 hover:bg-error-700",
                isResetting && "animate-pulse"
              )}
            >
              <RefreshCcwIcon
                className={cn("size-4", isResetting && "animate-spin")}
              />
              {isResetting ? "Retrying..." : "Try Again"}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 border-error-300 hover:bg-error-50 transition-all"
            >
              <Link href="/">
                <HomeIcon className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Error Details Collapsible */}
          <div className="w-full mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <BugIcon className="size-4" />
              <span>Technical Details</span>
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform duration-300",
                  showDetails && "rotate-180"
                )}
              />
            </button>

            {/* Error Details Panel */}
            <div
              className={cn(
                "mt-4 overflow-hidden transition-all duration-500 ease-in-out",
                showDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="bg-error-50 border border-error-200 rounded-lg p-4 text-left animate-in slide-in-from-top-2 fade-in-0 duration-300">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-error-900">
                      Error Message:
                    </span>
                    <p className="text-error-700 mt-1 font-mono text-xs break-all">
                      {error.message || "An unknown error occurred"}
                    </p>
                  </div>
                  {error.digest && (
                    <div>
                      <span className="font-semibold text-error-900">
                        Error ID:
                      </span>
                      <p className="text-error-700 mt-1 font-mono text-xs">
                        {error.digest}
                      </p>
                    </div>
                  )}
                  {error.stack && process.env.NODE_ENV === "development" && (
                    <div>
                      <span className="font-semibold text-error-900">
                        Stack Trace:
                      </span>
                      <pre className="text-error-700 mt-1 text-xs overflow-auto max-h-40 bg-error-100/50 p-2 rounded">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="w-full mt-6 pt-6 border-t border-error-200/50">
            <p className="text-sm text-muted-foreground mb-3">
              Still experiencing issues?
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-error-100 to-warning-100 hover:from-error-200 hover:to-warning-200 transition-all"
            >
              <Link href="/#">Contact Support Team</Link>
            </Button>
          </div>
        </EmptyContent>

        {/* Footer */}
        <div className="mt-6 animate-in fade-in-0 duration-700 delay-700">
          <p className="text-xs text-muted-foreground">
            Error occurred at {new Date().toLocaleString()}
          </p>
        </div>
      </Empty>
    </div>
  );
}
