import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 animate-spin text-primary-600" />
        <p className="text-lg font-medium text-default-900">Welcome</p>
      </div>
    </main>
  );
}

