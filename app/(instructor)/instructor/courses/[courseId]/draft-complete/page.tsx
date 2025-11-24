import { CourseEditWizard } from "@/components/Instructor/CourseEditWizard";

export default async function DraftCompletePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseEditWizard courseId={courseId} isDraft={true} />;
}

