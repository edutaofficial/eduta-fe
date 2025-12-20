import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn - Eduta",
  description: "Learn with interactive video lectures",
};

/**
 * Layout for lecture pages
 * Removes the main site header but keeps the footer
 * Uses LectureHeader for navigation
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* No main header - lecture pages have their own LectureHeader */}
      {children}
      <Footer />
    </>
  );
}

