"use client";

import * as React from "react";
import { InstructorSidebar } from "./InstructorSidebar";
import InstructorHeader from "./InstructorHeader";
import { useAuth } from "@/lib/context/AuthContext";
interface InstructorLayoutProps {
  children: React.ReactNode;
}

export function InstructorLayout({ children }: InstructorLayoutProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { logout } = useAuth();

  const handleMouseEnter = React.useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = React.useCallback(() => setIsHovered(false), []);

  return (
    <div className="flex h-screen bg-default-50">
      {/* Sidebar */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="Navigation sidebar"
      >
        <InstructorSidebar isHovered={isHovered} onLogout={logout} />
      </div>

      {/* Main Content - Padding for collapsed sidebar */}
      <main className="flex-1 pl-[5rem] relative">
        <InstructorHeader />
        <div className="pt-24 p-14">{children}</div>
      </main>
    </div>
  );
}
