"use client";

import * as React from "react";
import Link from "next/link";
import { SearchIcon, ExternalLinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CONSTANTS } from "@/lib/constants";

export function CertificatesTab() {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter certificates
  const filteredCertificates = React.useMemo(() => {
    let certificates = [...CONSTANTS.STUDENT_CERTIFICATES];

    // Apply search filter
    if (searchQuery) {
      certificates = certificates.filter(
        (cert) =>
          cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.issuedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return certificates;
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-default-300"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-default-700">
          Showing{" "}
          <span className="font-semibold text-default-900">
            {filteredCertificates.length}
          </span>{" "}
          results
        </p>
      </div>

      {/* Certificates Table */}
      {filteredCertificates.length > 0 ? (
        <div className="bg-white rounded-lg border border-default-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-default-50">
                <TableHead className="font-semibold text-default-900">
                  Course
                </TableHead>
                <TableHead className="font-semibold text-default-900">
                  Issued By
                </TableHead>
                <TableHead className="font-semibold text-default-900">
                  Enrollment Date
                </TableHead>
                <TableHead className="w-[180px]"/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id} className="hover:bg-default-50">
                  <TableCell className="font-medium">
                    <Link
                      href={certificate.certificateUrl}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
                    >
                      {certificate.courseTitle}
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-default-700">
                    {certificate.issuedBy}
                  </TableCell>
                  <TableCell className="text-default-700">
                    {new Date(certificate.enrollmentDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={certificate.verificationUrl}>
                        Verification Link
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-default-200 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="size-16 mx-auto bg-default-100 rounded-full flex items-center justify-center">
              <SearchIcon className="size-8 text-default-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-default-900">
                No certificates found
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete courses to earn certificates
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

