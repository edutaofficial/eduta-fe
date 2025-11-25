import { CourseDetailSkeleton } from "@/components/skeleton/CourseDetailSkeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <main className="min-h-screen">
            <CourseDetailSkeleton />
        </main>
    );
}

