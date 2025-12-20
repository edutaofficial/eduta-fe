"use client";

interface DescriptionTabProps {
  description?: string;
}

export function DescriptionTab({ description }: DescriptionTabProps) {
  if (!description) {
    return (
      <p className="text-sm text-default-500">
        No description provided for this lecture.
      </p>
    );
  }

  return (
    <div className="prose max-w-none text-sm text-default-800 dark:prose-invert prose-p:leading-relaxed prose-li:leading-relaxed">
      <div dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  );
}

