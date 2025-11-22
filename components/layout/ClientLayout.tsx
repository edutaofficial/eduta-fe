"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Instructor dashboard: /instructor or /instructor/* (NOT /instructors/*)
  const isInstructorDashboardRoute = pathname === "/instructor" || pathname?.startsWith("/instructor/");
  const isCertificateVerifyRoute = pathname?.startsWith("/certificate/verify");
  const isLearnRoute = pathname?.startsWith("/learn");

  // Routes without header/footer (instructor dashboard, certificate verify, and learn pages)
  // Note: /instructors/[id] (public profile) is different from /instructor (dashboard)
  if (isInstructorDashboardRoute || isCertificateVerifyRoute || isLearnRoute) {
    return (
      <div className="min-h-screen min-w-screen h-full w-full bg-default-900">
        {children}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
