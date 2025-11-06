"use client";

import * as React from "react";
import { CourseDetail } from "@/components/Common";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = React.use(params);
  return <CourseDetail courseId={courseId} />;
}
