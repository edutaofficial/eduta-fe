import { CourseEditWizard } from "@/components/Instructor/CourseEditWizard";

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CourseEditWizard courseId={params.courseId} isDraft={false} />;
}
