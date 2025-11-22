"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CreditCardIcon,
  SettingsIcon,
} from "lucide-react";

interface InstructorSidebarProps {
  isHovered: boolean;
  onLogout?: () => void;
}

export function InstructorSidebar({
  isHovered,
}: InstructorSidebarProps) {
  const pathname = usePathname();
  const sidebarWidth = isHovered ? "16rem" : "5rem";

  const menuItems = [
    {
      id: "courses",
      name: "Courses",
      icon: BookOpenIcon,
      href: "/instructor/courses",
    },
    {
      id: "announcements",
      name: "Announcement",
      icon: MegaphoneIcon,
      href: "/instructor/announcements",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: ChartBarIcon,
      href: "/instructor/analytics",
    },
    {
      id: "payments",
      name: "Payment",
      icon: CreditCardIcon,
      href: "/instructor/payments",
    },
    {
      id: "settings",
      name: "Settings",
      icon: SettingsIcon,
      href: "/instructor/settings",
    },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Instructor dashboard sidebar"
      className="fixed left-0 top-0 h-full bg-primary-900 transition-all duration-300 z-40"
      style={{ width: sidebarWidth }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo Section */}
        <div className="mb-8 flex items-center justify-center">
          <Link href="/" className="block">
            <Image
              src={isHovered ? "/logo-main.webp" : "/logo-collaped.webp"}
              alt="Eduta Logo"
              width={isHovered ? 120 : 40}
              height={isHovered ? 38 : 40}
              className="transition-all duration-300"
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${
                  isActive
                    ? "bg-primary-800 text-default-50"
                    : "text-default-50 hover:bg-primary-800"
                }`}
              >
                {/* Active indicator - blue right border */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary-400 rounded-l-full" />
                )}
                <Icon className="size-5 shrink-0" />
                <span
                  className={`text-sm font-medium transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0 w-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom spacing - removed user info and logout (now in header) */}
        <div className="mt-auto" />
      </div>
    </aside>
  );
}
