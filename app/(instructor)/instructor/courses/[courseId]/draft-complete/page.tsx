import { CourseEditWizard } from "@/components/Instructor/CourseEditWizard";

export default function DraftCompletePage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CourseEditWizard courseId={params.courseId} isDraft={true} />;
}

