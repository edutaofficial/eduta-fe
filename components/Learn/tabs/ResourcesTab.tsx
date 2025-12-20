"use client";

import { LectureResources } from "@/components/Learn/LectureResources";
import type { Lecture } from "@/app/api/learner/getCourseContent";

interface ResourcesTabProps {
  resources?: Lecture["resources"];
}

export function ResourcesTab({ resources }: ResourcesTabProps) {
  if (!resources?.length) {
    return (
      <p className="text-sm text-default-500">
        No downloadable resources for this lecture.
      </p>
    );
  }

  return <LectureResources resources={resources} />;
}

