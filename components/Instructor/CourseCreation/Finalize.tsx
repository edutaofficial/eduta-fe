"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useFormik } from "formik";
import * as z from "zod";

export type FinalizeHandle = { validateAndFocus: () => Promise<boolean> };

const finalizeSchema = z.object({
  welcomeMessage: z.string().min(1, "Welcome message is required"),
  congratulationsMessage: z
    .string()
    .min(1, "Congratulations message is required"),
});

type FinalizeValues = z.infer<typeof finalizeSchema>;

const FinalizeInner = (_: object, ref: React.Ref<FinalizeHandle>) => {
  const formik = useFormik<FinalizeValues>({
    initialValues: { welcomeMessage: "", congratulationsMessage: "" },
    validate: (values) => {
      const result = finalizeSchema.safeParse(values);
      if (result.success)
        return {} as Partial<Record<keyof FinalizeValues, unknown>>;
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        errors[key] = issue.message;
      }
      return errors;
    },
    onSubmit: () => {},
  });

  React.useImperativeHandle(ref, () => ({
    validateAndFocus: async () => {
      const errs = await formik.validateForm();
      formik.setTouched({
        welcomeMessage: Boolean(errs.welcomeMessage),
        congratulationsMessage: Boolean(errs.congratulationsMessage),
      });
      const hasErrors = Object.keys(errs).length > 0;
      if (hasErrors) {
        const el = document.getElementById(
          errs.welcomeMessage ? "welcome-message" : "congratulations-message"
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Finalize Your Course</h2>
        <p className="text-sm text-muted-foreground">
          Add welcome and congratulation messages for your students
        </p>
      </div>

      <div className="space-y-2" id="welcome-message">
        <Label htmlFor="welcome-message">
          Welcome Message <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={formik.values.welcomeMessage}
          onChange={(v) => formik.setFieldValue("welcomeMessage", v)}
          placeholder="Welcome students to your course. This message will be displayed when they first enroll."
          maxLength={2500}
        />
        {formik.touched.welcomeMessage && formik.errors.welcomeMessage && (
          <p className="text-sm text-destructive mt-1">
            {formik.errors.welcomeMessage}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          This message will be shown to students when they first join the
          course.
        </p>
      </div>

      <div className="space-y-2" id="congratulations-message">
        <Label htmlFor="congratulations-message">
          Congratulations Message <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={formik.values.congratulationsMessage}
          onChange={(v) => formik.setFieldValue("congratulationsMessage", v)}
          placeholder="Congratulate students on completing your course. This message will be displayed when they finish."
          maxLength={2500}
        />
        {formik.touched.congratulationsMessage &&
          formik.errors.congratulationsMessage && (
            <p className="text-sm text-destructive mt-1">
              {formik.errors.congratulationsMessage}
            </p>
          )}
        <p className="text-xs text-muted-foreground">
          This message will be shown to students when they complete the course.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-success-50 border border-success-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Ready to Publish! 🎉</h3>
        <p className="text-sm text-success-700">
          Review all your information above and click &quot;Save & Publish&quot;
          when ready. You can always edit the course after publishing.
        </p>
      </div>
    </div>
  );
};

export const Finalize = React.forwardRef<FinalizeHandle, object>(FinalizeInner);
