import { InstructorLayout } from "@/components/Instructor/Layout";

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
