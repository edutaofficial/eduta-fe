"use client";

import * as React from "react";
import Link from "next/link";
import { SearchIcon, ExternalLinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLearnerStore } from "@/store/useLearnerStore";

export function CertificatesTab() {
  const { 
    certificates, 
    loading, 
    fetchCertificates 
  } = useLearnerStore();

  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch certificates on mount
  React.useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Filter certificates
  const filteredCertificates = React.useMemo(() => {
    let certs = [...certificates];

    // Apply search filter
    if (searchQuery) {
      certs = certs.filter(
        (cert) =>
          cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return certs;
  }, [certificates, searchQuery]);

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
      {loading.fetchCertificates ? (
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
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredCertificates.length > 0 ? (
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
                  Issued Date
                </TableHead>
                <TableHead className="w-[180px]"/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.certificateId} className="hover:bg-default-50">
                  <TableCell className="font-medium">
                    {certificate.certificateUrl ? (
                    <Link
                      href={certificate.certificateUrl}
                      target="_blank"
                      className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-2"
                    >
                      {certificate.courseTitle}
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                    ) : (
                      <span className="text-default-900 flex items-center gap-2">
                        {certificate.courseTitle}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-default-700">
                    {certificate.instructorName}
                  </TableCell>
                  <TableCell className="text-default-700">
                    {new Date(certificate.issuedAt).toLocaleDateString(
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
                      <Link href={`/certificate/verify/${certificate.certificateId}`}>
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
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Complete courses to earn certificates"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
