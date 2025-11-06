"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as z from "zod";
import type { UICurriculum } from "@/types/course";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  CourseAccordion,
  CourseAccordionContent,
  CourseAccordionItem,
  CourseAccordionTrigger,
} from "@/components/ui/course-accordion";
import { PlusIcon, UploadIcon, EyeIcon } from "lucide-react";
import { useCourseStore } from "@/store/useCourseStore";
import { UploadFile } from "@/components/Common";

export type CurriculumHandle = { validateAndFocus: () => Promise<boolean> };

interface CurriculumProps {
  onPreview?: () => void;
}

const curriculumSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.union([z.number(), z.string()]),
        name: z.string().min(1, "Section name is required"),
        description: z.string().min(1, "Section description is required"),
        lectures: z.array(
          z.object({
            id: z.union([z.number(), z.string()]),
            name: z.string().min(1, "Lecture name is required"),
            description: z.string().min(1, "Lecture description is required"),
            video: z.string().min(1, "Lecture video is required"),
            resources: z.string().optional().nullable(),
            duration: z.number().optional(),
            isPreview: z.boolean().optional(),
          })
        ),
      })
    )
    .min(1),
});

const CurriculumInner = (
  { onPreview }: CurriculumProps,
  ref: React.Ref<CurriculumHandle>
) => {
  const { curriculum, setCurriculum, setUploading } = useCourseStore();
  const [uploadingLectures, setUploadingLectures] = React.useState<
    Record<string, boolean>
  >({});

  // Track if any lecture is uploading and update store (prevent infinite loops)
  const prevUploadingRef = React.useRef<Record<string, boolean>>({});
  React.useEffect(() => {
    const isAnyUploading = Object.values(uploadingLectures).some(Boolean);
    const prevIsAnyUploading = Object.values(prevUploadingRef.current).some(
      Boolean
    );

    // Only update if state actually changed
    if (isAnyUploading !== prevIsAnyUploading) {
      prevUploadingRef.current = uploadingLectures;
      setUploading({ curriculum: isAnyUploading });
    }
  }, [uploadingLectures, setUploading]);

  // Stable incremental id (no randomness during render)
  const nextIdRef = React.useRef(2);
  const getNextId = () => {
    nextIdRef.current += 1;
    return nextIdRef.current;
  };

  // Initialize with store data or default
  // Transform store format to form format
  const initialSections =
    curriculum.sections.length > 0
      ? curriculum.sections.map((section) => ({
          id: section.id,
          name:
            "title" in section
              ? section.title
              : (section as { name: string }).name,
          description: section.description,
          lectures: section.lectures.map((lecture) => ({
            id: lecture.id,
            name:
              "title" in lecture
                ? lecture.title
                : (lecture as { name: string }).name,
            description: lecture.description,
            video:
              "videoId" in lecture
                ? String(lecture.videoId || "")
                : (lecture as { video: string }).video,
            resources:
              "resources" in lecture && Array.isArray(lecture.resources)
                ? lecture.resources.map((r) => r.fileId).join(",")
                : (lecture as unknown as { resources?: string | null })
                    .resources || "",
            duration: lecture.duration || 15,
            isPreview:
              "isFree" in lecture
                ? lecture.isFree
                : (lecture as { isPreview?: boolean }).isPreview || false,
          })),
        }))
      : [
          {
            id: 1,
            name: "Untitled",
            description: "",
            lectures: [
              {
                id: 1,
                name: "Untitled",
                description: "",
                video: "",
                resources: "",
                duration: 15,
                isPreview: false,
              },
            ],
          },
        ];

  const formik = useFormik<z.infer<typeof curriculumSchema>>({
    initialValues: {
      sections: initialSections,
    },
    validate: (values) => {
      const result = curriculumSchema.safeParse(values);
      if (result.success) return {} as Record<string, unknown>;
      const errors: Record<string, unknown> = {};
      for (const issue of result.error.issues) {
        const segments = issue.path as (string | number)[];
        let curr: Record<string, unknown> = errors;
        segments.forEach((seg, idx) => {
          const key = String(seg);
          if (idx === segments.length - 1) {
            curr[key] = issue.message;
          } else {
            if (typeof curr[key] !== "object" || curr[key] === null)
              curr[key] = {};
            curr = curr[key] as Record<string, unknown>;
          }
        });
      }
      return errors as Record<string, unknown>;
    },
    onSubmit: () => {},
  });

  // Sync formik values to store (UI format)
  React.useEffect(() => {
    setCurriculum({
      sections: formik.values.sections as unknown as UICurriculum["sections"],
    });
  }, [formik.values.sections, setCurriculum]);

  // Handle lecture video upload state change - memoized to prevent infinite loops
  const handleLectureUploadStateChange = React.useCallback(
    (
      sectionId: number | string,
      lectureId: number | string,
      isUploading: boolean
    ) => {
      const key = `${sectionId}-${lectureId}`;
      setUploadingLectures((prev) => {
        // Only update if value actually changed
        if (prev[key] === isUploading) return prev;
        return { ...prev, [key]: isUploading };
      });
    },
    []
  );

  const addSection = () => {
    const next = [
      ...formik.values.sections,
      {
        id: getNextId(),
        name: "Untitled",
        description: "",
        lectures: [
          {
            id: getNextId(),
            name: "Untitled",
            description: "",
            video: "",
            resources: "",
          },
        ],
      },
    ];
    formik.setFieldValue("sections", next);
  };

  const updateSection = (
    sectionId: number | string,
    field: string,
    value: string
  ) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId ? { ...s, [field]: value } : s
    );
    formik.setFieldValue("sections", next);
  };

  const addLecture = (sectionId: number | string) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            lectures: [
              ...s.lectures,
              {
                id: getNextId(),
                name: "Untitled",
                description: "",
                video: "",
                resources: "",
                duration: 15,
                isPreview: false,
              },
            ],
          }
        : s
    );
    formik.setFieldValue("sections", next);
  };

  const updateLecture = (
    sectionId: number | string,
    lectureId: number | string,
    field: string,
    value: string | number | boolean
  ) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            lectures: s.lectures.map((lec) =>
              lec.id === lectureId
                ? {
                    ...lec,
                    [field]:
                      field === "duration"
                        ? typeof value === "number"
                          ? value
                          : value
                            ? parseInt(String(value), 10)
                            : undefined
                        : field === "isPreview"
                          ? typeof value === "boolean"
                            ? value
                            : value === "true"
                          : value,
                  }
                : lec
            ),
          }
        : s
    );
    formik.setFieldValue("sections", next);
  };

  // ---------- Validation helpers ----------
  const isSectionValid = (section: {
    name: string;
    description: string;
    lectures: {
      name: string;
      description: string;
      video: string;
      duration?: number;
    }[];
  }) => {
    if (!section.name.trim()) return false;
    if (!section.description.trim()) return false;
    for (const lec of section.lectures) {
      if (!lec.name.trim()) return false;
      if (!lec.description.trim()) return false;
      if (!lec.video.trim()) return false;
      if (!lec.duration || lec.duration <= 0) return false; // duration required
    }
    return true;
  };

  const [showErrors, setShowErrors] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    validateAndFocus: async () => {
      const allValid = formik.values.sections.every(isSectionValid);
      if (allValid) return true;
      setShowErrors(true);
      // find first invalid field and scroll
      for (const section of formik.values.sections) {
        if (!section.name.trim()) {
          const el = document.getElementById(`section-name-${section.id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          return false;
        }
        if (!section.description.trim()) {
          const el = document.getElementById(`section-desc-${section.id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          return false;
        }
        for (const lecture of section.lectures) {
          if (!lecture.name.trim()) {
            const el = document.getElementById(`lecture-name-${lecture.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
          }
          if (!lecture.description.trim()) {
            const el = document.getElementById(`lecture-desc-${lecture.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
          }
          if (!lecture.video.trim()) {
            const el = document.getElementById(`lecture-video-${lecture.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
          }
          if (!lecture.duration || lecture.duration <= 0) {
            const el = document.getElementById(
              `lecture-duration-${lecture.id}`
            );
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
          }
        }
      }
      return false;
    },
  }));

  const removeSection = (sectionId: number | string) => {
    const next = formik.values.sections.filter((s) => s.id !== sectionId);
    formik.setFieldValue("sections", next);
  };

  const removeLecture = (
    sectionId: number | string,
    lectureId: number | string
  ) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId
        ? { ...s, lectures: s.lectures.filter((lec) => lec.id !== lectureId) }
        : s
    );
    formik.setFieldValue("sections", next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course Curriculum</h2>
          <p className="text-sm text-muted-foreground">
            Organize your course into sections and lectures
          </p>
        </div>
        <Button onClick={addSection} variant="outline" className="gap-2">
          <PlusIcon className="size-4" />
          Add Section
        </Button>
      </div>

      <CourseAccordion
        type="multiple"
        defaultValue={[`section-${formik.values.sections[0]?.id}`]}
      >
        {formik.values.sections.map((section, sectionIndex) => (
          <CourseAccordionItem
            key={section.id}
            value={`section-${section.id}`}
            className="mb-4"
          >
            <CourseAccordionTrigger
              variant="section"
              onClose={
                formik.values.sections.length > 1
                  ? () => removeSection(section.id)
                  : undefined
              }
            >
              <span className="font-medium text-lg">
                Section {sectionIndex + 1} | {section.name}
              </span>
            </CourseAccordionTrigger>
            <CourseAccordionContent>
              <div className="p-6">
                {/* Section Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Section Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`section-name-${section.id}`}
                      placeholder="Enter section name"
                      value={section.name}
                      className="bg-white"
                      onChange={(e) =>
                        updateSection(section.id, "name", e.target.value)
                      }
                      aria-invalid={showErrors && !section.name.trim()}
                    />
                    {showErrors && !section.name.trim() && (
                      <p className="text-sm text-destructive mt-1">
                        Section name is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Section Description{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div id={`section-desc-${section.id}`}>
                      <RichTextEditor
                        className="bg-white"
                        value={section.description}
                        onChange={(value) =>
                          updateSection(section.id, "description", value)
                        }
                        placeholder="Describe what students will learn in this section..."
                        maxLength={2500}
                      />
                    </div>
                    {showErrors && !section.description.trim() && (
                      <p className="text-sm text-destructive mt-1">
                        Section description is required
                      </p>
                    )}
                  </div>
                </div>

                {/* Lectures */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Lectures</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addLecture(section.id)}
                      className="gap-2"
                    >
                      <PlusIcon className="size-4" />
                      Add Lecture
                    </Button>
                  </div>

                  <CourseAccordion type="multiple" className="space-y-2">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <CourseAccordionItem
                        key={lecture.id}
                        value={`lecture-${lecture.id}`}
                        className="mb-2"
                        variant="lecture"
                      >
                        <CourseAccordionTrigger
                          variant="lecture"
                          onClose={
                            section.lectures.length > 1
                              ? () => removeLecture(section.id, lecture.id)
                              : undefined
                          }
                        >
                          <span className="text-sm">
                            Lecture {lectureIndex + 1} | {lecture.name}
                          </span>
                        </CourseAccordionTrigger>
                        <CourseAccordionContent>
                          <div className="space-y-4 p-6">
                            <div className="space-y-2">
                              <Label>
                                Lecture Name{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`lecture-name-${lecture.id}`}
                                placeholder="Enter lecture name"
                                value={lecture.name}
                                className="bg-white"
                                onChange={(e) =>
                                  updateLecture(
                                    section.id,
                                    lecture.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                aria-invalid={
                                  showErrors && !lecture.name.trim()
                                }
                              />
                              {showErrors && !lecture.name.trim() && (
                                <p className="text-sm text-destructive mt-1">
                                  Lecture name is required
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>
                                Lecture Description{" "}
                                <span className="text-destructive">*</span>
                              </Label>
                              <div id={`lecture-desc-${lecture.id}`}>
                                <RichTextEditor
                                  value={lecture.description}
                                  className="bg-white"
                                  onChange={(value) =>
                                    updateLecture(
                                      section.id,
                                      lecture.id,
                                      "description",
                                      value
                                    )
                                  }
                                  placeholder="Describe this lecture..."
                                  maxLength={2500}
                                />
                              </div>
                              {showErrors && !lecture.description.trim() && (
                                <p className="text-sm text-destructive mt-1">
                                  Lecture description is required
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <UploadFile
                                  label="Lecture Video"
                                  accept="video/*"
                                  value={
                                    lecture.video
                                      ? parseInt(lecture.video, 10)
                                      : null
                                  }
                                  onChange={(assetId) => {
                                    updateLecture(
                                      section.id,
                                      lecture.id,
                                      "video",
                                      assetId ? String(assetId) : ""
                                    );
                                  }}
                                  onUploadStateChange={(isUploading) => {
                                    handleLectureUploadStateChange(
                                      section.id,
                                      lecture.id,
                                      isUploading
                                    );
                                  }}
                                  error={
                                    showErrors && !lecture.video.trim()
                                      ? "Lecture video is required"
                                      : undefined
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Resources (Optional)</Label>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.zip"
                                  id={`lecture-resources-input-${lecture.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Handle resource upload - store as asset ID for now
                                      // TODO: Implement resource upload similar to video upload
                                      // Resource upload not yet implemented
                                    }
                                  }}
                                />
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    document
                                      .getElementById(
                                        `lecture-resources-input-${lecture.id}`
                                      )
                                      ?.click();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      document
                                        .getElementById(
                                          `lecture-resources-input-${lecture.id}`
                                        )
                                        ?.click();
                                    }
                                  }}
                                  className="border-2 border-dashed bg-white rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                                >
                                  <UploadIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Upload resources
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Lecture Duration and Preview Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>
                                  Duration (minutes){" "}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id={`lecture-duration-${lecture.id}`}
                                  type="number"
                                  min="1"
                                  placeholder="15"
                                  value={lecture.duration || ""}
                                  onChange={(e) => {
                                    const duration =
                                      parseInt(e.target.value, 10) || undefined;
                                    updateLecture(
                                      section.id,
                                      lecture.id,
                                      "duration",
                                      duration ? String(duration) : ""
                                    );
                                  }}
                                  className="bg-white"
                                  aria-invalid={
                                    showErrors &&
                                    (!lecture.duration || lecture.duration <= 0)
                                  }
                                />
                                {showErrors &&
                                  (!lecture.duration ||
                                    lecture.duration <= 0) && (
                                    <p className="text-sm text-destructive mt-1">
                                      Duration is required and must be greater
                                      than 0
                                    </p>
                                  )}
                              </div>
                              <div className="space-y-2 flex items-end">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`lecture-preview-${lecture.id}`}
                                    checked={lecture.isPreview ?? false}
                                    onChange={(e) => {
                                      updateLecture(
                                        section.id,
                                        lecture.id,
                                        "isPreview",
                                        e.target.checked ? "true" : "false"
                                      );
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <Label
                                    htmlFor={`lecture-preview-${lecture.id}`}
                                    className="cursor-pointer"
                                  >
                                    Allow preview (free)
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CourseAccordionContent>
                      </CourseAccordionItem>
                    ))}
                  </CourseAccordion>
                </div>
              </div>
            </CourseAccordionContent>
          </CourseAccordionItem>
        ))}
      </CourseAccordion>

      {/* Preview Button */}
      {onPreview && (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPreview}
            className="w-full gap-2"
          >
            <EyeIcon className="size-4" />
            Preview Course
          </Button>
        </div>
      )}
    </div>
  );
};

export const Curriculum = React.forwardRef<CurriculumHandle, CurriculumProps>(
  CurriculumInner
);
