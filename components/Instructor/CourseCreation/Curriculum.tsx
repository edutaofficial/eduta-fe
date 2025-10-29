"use client";

import * as React from "react";
import { useFormik } from "formik";
import * as z from "zod";
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
import { UploadIcon, PlusIcon } from "lucide-react";

export type CurriculumHandle = { validateAndFocus: () => Promise<boolean> };

const curriculumSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Section name is required"),
        description: z.string().min(1, "Section description is required"),
        lectures: z.array(
          z.object({
            id: z.number(),
            name: z.string().min(1, "Lecture name is required"),
            description: z.string().min(1, "Lecture description is required"),
            video: z.string().min(1, "Lecture video is required"),
            resources: z.string().optional().nullable(),
          })
        ),
      })
    )
    .min(1),
});

const CurriculumInner = (_: object, ref: React.Ref<CurriculumHandle>) => {
  // Stable incremental id (no randomness during render)
  const nextIdRef = React.useRef(2);
  const getNextId = () => {
    nextIdRef.current += 1;
    return nextIdRef.current;
  };

  const formik = useFormik<z.infer<typeof curriculumSchema>>({
    initialValues: {
      sections: [
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
            },
          ],
        },
      ],
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

  const updateSection = (sectionId: number, field: string, value: string) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId ? { ...s, [field]: value } : s
    );
    formik.setFieldValue("sections", next);
  };

  const addLecture = (sectionId: number) => {
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
              },
            ],
          }
        : s
    );
    formik.setFieldValue("sections", next);
  };

  const updateLecture = (
    sectionId: number,
    lectureId: number,
    field: string,
    value: string
  ) => {
    const next = formik.values.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            lectures: s.lectures.map((lec) =>
              lec.id === lectureId ? { ...lec, [field]: value } : lec
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
    lectures: { name: string; description: string; video: string }[];
  }) => {
    if (!section.name.trim()) return false;
    if (!section.description.trim()) return false;
    for (const lec of section.lectures) {
      if (!lec.name.trim()) return false;
      if (!lec.description.trim()) return false;
      if (!lec.video.trim()) return false; // resources optional
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
        }
      }
      return false;
    },
  }));

  const removeSection = (sectionId: number) => {
    const next = formik.values.sections.filter((s) => s.id !== sectionId);
    formik.setFieldValue("sections", next);
  };

  const removeLecture = (sectionId: number, lectureId: number) => {
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
                                <Label>
                                  Lecture Video{" "}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <div
                                  id={`lecture-video-${lecture.id}`}
                                  className="border-2 border-dashed bg-white rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
                                >
                                  <UploadIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Upload video
                                  </p>
                                </div>
                                {showErrors && !lecture.video.trim() && (
                                  <p className="text-sm text-destructive mt-1">
                                    Lecture video is required
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Resources</Label>
                                <div className="border-2 border-dashed bg-white rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                                  <UploadIcon className="size-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Upload resources
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end">
                              <Button
                                variant="default"
                                disabled={!isSectionValid(section)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </CourseAccordionContent>
                      </CourseAccordionItem>
                    ))}
                  </CourseAccordion>
                </div>

                <div className="flex items-center justify-end mt-6">
                  <Button disabled={showErrors && !isSectionValid(section)}>
                    Save Section
                  </Button>
                </div>
              </div>
            </CourseAccordionContent>
          </CourseAccordionItem>
        ))}
      </CourseAccordion>
    </div>
  );
};

export const Curriculum = React.forwardRef<CurriculumHandle, object>(
  CurriculumInner
);
