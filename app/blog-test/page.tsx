"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/toast";

export default function BlogTestPage() {
  const certificateRef = React.useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
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

  const currentDate = formatDate(new Date());

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
      pdf.save("Certificate_Abdullah_Khan_Master_AI.pdf");
      
      showToast("Certificate downloaded successfully!", "success");
    } catch {
      showToast("Failed to generate certificate. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Certificate Test Section */}
        <div className="p-8 bg-white border-2 border-blue-200 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-default-900 mb-2">
              🎓 Certificate Generator Test
            </h2>
            <p className="text-default-600">
              Generate a certificate for Abdullah Khan - Master AI Course
            </p>
          </div>
          <Button
            onClick={handleDownloadCertificate}
            disabled={isGenerating}
            size="lg"
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg"
          >
            {isGenerating ? "Generating..." : "Download Certificate"}
          </Button>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white p-4 rounded-lg shadow-xl">
          <div
            ref={certificateRef}
            className="relative w-full mx-auto"
            style={{ 
              maxWidth: "1200px",
              width: "100%"
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
                Abdullah Khan
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
                Master AI
              </p>
            </div>

            {/* Date Overlay */}
            <div
              className="absolute"
              style={{
                top: "65%",
                left: "26%",
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
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-default-500 mt-4 text-center">
          This certificate will be downloaded as a high-quality PDF file
        </p>
        </div>
      </div>
    </div>
  );
}

