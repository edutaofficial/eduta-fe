"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: "Courses", href: "/student/courses" },
    { label: "Wishlist", href: "/student/wishlist" },
    { label: "Certificates", href: "/student/certificates" },
    { label: "Settings", href: "/student/settings" },
  ];

  return (
    <div className="min-h-screen bg-default-50">
      <div className="mt-[4.4rem]">
        {/* Header with Tabs */}
        <div className="bg-primary-900 p-8 mb-8 text-white">
          <div className="max-w-container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">My Learning</h1>
            <p className="text-primary-100 mt-2 mb-6">
              Track your progress and continue learning
            </p>

            {/* Tabs Navigation */}
            <div className="flex gap-8 border-b border-white/20"> 
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "pb-3 font-medium transition-colors relative",
                    pathname === tab.href
                      ? "text-white"
                      : "text-default-100 hover:text-white"
                  )}
                >
                  {tab.label}
                  {pathname === tab.href && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-container mx-auto px-4 pb-14">{children}</div>
      </div>
    </div>
  );
}
