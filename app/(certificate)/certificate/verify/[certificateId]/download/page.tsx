"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCertificateById } from "@/app/api/learner/getCertificates";
import { CertificateGenerator } from "@/components/Certificate/CertificateGenerator";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CertificateDownloadPageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default function CertificateDownloadPage({
  params,
}: CertificateDownloadPageProps) {
  const { certificateId } = React.use(params);

  const {
    data: certificate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: () => getCertificateById(certificateId),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!certificateId,
  });

  // Format date with ordinal suffix
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="size-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Loader2Icon className="size-8 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-default-900 mb-2">
            Loading Certificate...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your certificate.
          </p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="size-16 mx-auto bg-error-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="size-8 text-error-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-default-900 mb-2">
            Certificate Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The certificate you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    );
  }

  const certificateData = {
    studentName: certificate.recipientName,
    courseName: certificate.courseTitle,
    completionDate: formatDate(new Date(certificate.issuedAt)),
    certificateNumber: certificate.certificateNumber,
  };

  return (
    <CertificateGenerator
      certificateData={certificateData}
      showControls={true}
    />
  );
}

