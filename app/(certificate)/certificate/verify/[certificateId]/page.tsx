"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCertificateById } from "@/app/api/learner/getCertificates";

interface CertificateVerifyPageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default function CertificateVerifyPage({
  params,
}: CertificateVerifyPageProps) {
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
            Please wait while we verify the certificate.
          </p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
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

  return (
    <div
      className="min-h-screen p-4 md:p-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/certificate-verification.webp')" }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/80 -z-10" />

      {/* Logo - Top Left */}
      <div className="mb-8 relative z-10">
        <Link href="/">
          <Image
            src="/logo-main.webp"
            alt="Eduta Logo"
            width={219}
            height={70}
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* Main Content */}

      {/* Certificate Card */}
      <div className="bg-white p-6 border-t-4 border-primary-400 max-w-5xl mx-auto mb-10 flex flex-col gap-8 relative z-10 shadow-lg">
        <h1 className="text-2xl w-full text-center md:text-3xl font-semibold text-default-900">
          Certificate Verification
        </h1>

        <div className="bg-primary-400 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Image
            src="/imgs/eduta-white-logo.webp"
            alt="Eduta Logo"
            width={157}
            height={50}
            className="h-12 w-auto"
          />

          {/* Right Side - View Certificate Link */}
          {certificate.certificateUrl && (
            <Button
              asChild
              variant="secondary"
              className=" text-white hover:underline bg-transparent hover:bg-transparent hover:text-white"
            >
              <Link
                href={certificate.certificateUrl}
                target="_blank"
                className="flex items-center gap-2 text-xl"
              >
                View Certificate
                <ExternalLinkIcon className="size-6" />
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Status */}
          <p className="text-3xl text-default-600">
            {certificate.isActive ? "Active" : "Inactive"}
          </p>

          {/* Certificate Title */}
          {certificate.certificateTitle && (
            <p className="text-4xl text-default-900">
              {certificate.certificateTitle}
            </p>
          )}

          {/* Recipient Name */}
          <p className="text-3xl font-semibold underline">
            {certificate.recipientName}
          </p>

          {/* Course Title */}
          <div>
            <p className="text-sm text-default-500 mb-1">Course</p>
            <p className="text-lg font-medium text-default-900">
              {certificate.courseTitle}
            </p>
          </div>

          {/* Instructor */}
          <div>
            <p className="text-sm text-default-500 mb-1">Instructor</p>
            <p className="text-lg font-medium text-default-900">
              {certificate.instructorName}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500 mb-1">Issued At</p>
              <p className="font-medium text-default-900">
                {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {certificate.expiresAt && (
              <div>
                <p className="text-sm text-default-500 mb-1">Expires At</p>
                <p className="font-medium text-default-900">
                  {new Date(certificate.expiresAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Certificate Number */}
          <div className="border-t border-default-200 pt-4">
            <p className="text-sm text-default-500 mb-1">Certificate Number</p>
            <p className="font-mono text-sm text-default-900">
              {certificate.certificateNumber}
            </p>
          </div>

          {/* Verification Code */}
          <div>
            <p className="text-sm text-default-500 mb-1">Verification Code</p>
            <p className="font-mono text-sm text-default-900">
              {certificate.verificationCode}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl p-6 border border-default-200 shadow-lg max-w-5xl mx-auto relative z-10">
        <h3 className="font-semibold text-default-900 mb-3">
          About This Certificate
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {certificate.description ||
            `This certificate verifies that ${certificate.recipientName} has successfully completed the course "${certificate.courseTitle}" on Eduta. The certificate is issued by ${certificate.instructorName}${
              certificate.expiresAt
                ? ` and is valid until ${new Date(
                    certificate.expiresAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : ""
            }. This certificate can be verified at any time using the verification code above.`}
        </p>
      </div>
    </div>
  );
}
