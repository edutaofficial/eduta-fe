"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/toast";
import { DownloadIcon, ZoomInIcon, ZoomOutIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string; // Format: "18th Dec 2024"
  certificateNumber?: string;
}

interface CertificateGeneratorProps {
  certificateData: CertificateData;
  showControls?: boolean;
  onDownloadComplete?: () => void;
}

export function CertificateGenerator({
  certificateData,
  showControls = true,
  onDownloadComplete,
}: CertificateGeneratorProps) {
  const certificateRef = React.useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const { showToast } = useToast();

  // Format date with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
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

  const displayDate = certificateData.completionDate || formatDate(new Date());

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);

    try {
      // Wait a bit to ensure all images are fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the certificate as canvas with specific dimensions
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      const fileName = `Certificate_${certificateData.studentName.replace(/\s+/g, "_")}_${certificateData.courseName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
      
      showToast("Certificate downloaded successfully!", "success");
      
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    } catch {
      showToast("Failed to generate certificate. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 150) {
      setZoom(prev => Math.min(prev + 10, 150));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(prev => Math.max(prev - 10, 50));
    }
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-default-100 to-default-200 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* PDF Viewer Controls */}
        {showControls && (
          <div className="bg-white border-2 border-default-300 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Side - Home Button */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Link href="/">
                  <HomeIcon className="size-4" />
                  Home
                </Link>
              </Button>

              {/* Center - Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleZoomOut}
                  variant="outline"
                  size="sm"
                  disabled={zoom <= 50}
                  className="gap-2"
                >
                  <ZoomOutIcon className="size-4" />
                  Zoom Out
                </Button>
                
                <button
                  onClick={handleResetZoom}
                  className="px-4 py-2 text-sm font-medium text-default-700 hover:text-default-900 transition-colors"
                >
                  {zoom}%
                </button>
                
                <Button
                  onClick={handleZoomIn}
                  variant="outline"
                  size="sm"
                  disabled={zoom >= 150}
                  className="gap-2"
                >
                  <ZoomInIcon className="size-4" />
                  Zoom In
                </Button>
              </div>

              {/* Right Side - Download Button */}
              <Button
                onClick={handleDownloadCertificate}
                disabled={isGenerating}
                size="sm"
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg gap-2"
              >
                <DownloadIcon className="size-4" />
                {isGenerating ? "Generating..." : "Download Certificate"}
              </Button>
            </div>
          </div>
        )}

        {/* Certificate Preview Container */}
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-default-300">
          <div className="overflow-auto max-h-[calc(100vh-250px)]">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <div
                ref={certificateRef}
                className="relative w-full mx-auto"
                style={{ 
                  maxWidth: "1200px",
                  width: "100%",
                  margin: "0 auto",
                }}
              >
                {/* Certificate Background Image - Using standard img for consistent html2canvas rendering */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/certificate-final.png"
                  alt="Certificate"
                  className="w-full h-auto block"
                  style={{ display: "block" }}
                />

                {/* Student Name Overlay */}
                <div
                  className="absolute"
                  style={{
                    top: "15%",
                    left: "60%",
                    transform: "translateX(-50%)",
                    width: "80%",
                  }}
                >
                  <p
                    className="font-bold text-primary-600"
                    style={{
                      fontSize: "36px",
                      letterSpacing: "0.05em",
                      margin: 0,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    {certificateData.studentName}
                  </p>
                </div>

                {/* Course Name Overlay */}
                <div
                  className="absolute"
                  style={{
                    top: "30%",
                    left: "60%",
                    transform: "translateX(-50%)",
                    width: "80%",
                  }}
                >
                  <p
                    className="font-bold text-primary-600"
                    style={{
                      fontSize: "24px",
                      letterSpacing: "0.03em",
                      margin: 0,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    {certificateData.courseName}
                  </p>
                </div>

                {/* Date Overlay */}
                <div
                  className="absolute"
                  style={{
                    top: "65%",
                    left: "25.5%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <p
                    className="font-medium text-default-800"
                    style={{
                      fontSize: "16px",
                      letterSpacing: "0.02em",
                      margin: 0,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    {displayDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-sm text-default-500 mt-6 text-center">
            This certificate will be downloaded as a high-quality PDF file
          </p>
        </div>
      </div>
    </div>
  );
}

