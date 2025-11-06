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
  const isInstructorRoute = pathname?.startsWith("/instructor");
  const isCertificateVerifyRoute = pathname?.startsWith("/certificate/verify");

  // Routes without header/footer
  if (isInstructorRoute || isCertificateVerifyRoute) {
    return (
      <div className="min-h-screen min-w-screen h-full w-full bg-[url('/certificate-verification.webp')] bg-cover bg-center">
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
