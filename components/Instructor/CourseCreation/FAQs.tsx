"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCourseStore } from "@/store/useCourseStore";
import { EyeIcon, PlusIcon, TrashIcon } from "lucide-react";
import type { FAQ } from "@/app/api/instructor/faqs";

export type FAQsHandle = { validateAndFocus: () => Promise<boolean> };

interface FAQsProps {
  onPreview?: () => void;
}

const FAQsInner = ({ onPreview }: FAQsProps, ref: React.Ref<FAQsHandle>) => {
  const { faqs, setFAQs } = useCourseStore();
  const [localFAQs, setLocalFAQs] = React.useState<Array<{ question: string; answer: string; faqId?: string }>>(
    faqs && faqs.length > 0
      ? faqs.map((f) => ({ question: f.question, answer: f.answer, faqId: f.faqId }))
      : [
          { question: "", answer: "" },
          { question: "", answer: "" },
          { question: "", answer: "" },
        ]
  );
  const [showErrors, setShowErrors] = React.useState(false);

  // Sync from store when FAQs change (e.g., when navigating back)
  React.useEffect(() => {
    if (faqs && faqs.length > 0) {
      setLocalFAQs(faqs.map((f) => ({ question: f.question, answer: f.answer, faqId: f.faqId })));
    }
  }, [faqs]);

  // Expose validation method via ref
  React.useImperativeHandle(ref, () => ({
    validateAndFocus: async () => {
      setShowErrors(true);

      // Validate minimum FAQs (3)
      if (localFAQs.length < 3) {
        // eslint-disable-next-line no-alert
        alert("Please add at least 3 FAQs before proceeding.");
        return false;
      }

      // Validate all FAQs have content
      const hasEmptyFields = localFAQs.some(
        (faq) => !faq.question.trim() || !faq.answer.trim()
      );

      if (hasEmptyFields) {
        // Find first empty field and focus
        const firstEmptyIndex = localFAQs.findIndex(
          (faq) => !faq.question.trim() || !faq.answer.trim()
        );
        if (firstEmptyIndex !== -1) {
          const questionInput = document.querySelector(
            `textarea[name="faq-question-${firstEmptyIndex}"]`
          ) as HTMLTextAreaElement;
          if (questionInput && !localFAQs[firstEmptyIndex].question.trim()) {
            questionInput.focus();
            return false;
          }
          const answerInput = document.querySelector(
            `textarea[name="faq-answer-${firstEmptyIndex}"]`
          ) as HTMLTextAreaElement;
          if (answerInput) {
            answerInput.focus();
            return false;
          }
        }
        return false;
      }

      // Save to store
      const faqsToSave: FAQ[] = localFAQs.map((faq, index) => ({
        faqId: faq.faqId || `temp-${index}`,
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }));

      setFAQs(faqsToSave);
      return true;
    },
  }));

  const addFAQ = () => {
    if (localFAQs.length < 15) {
      setLocalFAQs([...localFAQs, { question: "", answer: "" }]);
    }
  };

  const removeFAQ = (index: number) => {
    if (localFAQs.length > 3) {
      const newFAQs = localFAQs.filter((_, i) => i !== index);
      setLocalFAQs(newFAQs);
      // Update store immediately - don't trim here, allow spaces
      const faqsToSave: FAQ[] = newFAQs.map((faq, i) => ({
        faqId: faq.faqId || `temp-${i}`,
        question: faq.question, // Keep raw value, don't trim
        answer: faq.answer,     // Keep raw value, don't trim
      }));
      setFAQs(faqsToSave);
    }
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const newFAQs = [...localFAQs];
    newFAQs[index] = { ...newFAQs[index], [field]: value };
    setLocalFAQs(newFAQs);
    // Update store immediately - don't trim here, allow spaces while typing
    // Trimming will happen only during validation/save
    const faqsToSave: FAQ[] = newFAQs.map((faq, i) => ({
      faqId: faq.faqId || `temp-${i}`,
      question: faq.question, // Keep raw value, don't trim
      answer: faq.answer,     // Keep raw value, don't trim
    }));
    setFAQs(faqsToSave);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-default-900">FAQs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add frequently asked questions to help students understand your course better.
          </p>
        </div>
        {onPreview && (
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <EyeIcon className="size-4" />
            Preview
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {localFAQs.map((faq, index) => (
          <div
            key={index}
            className="border border-default-200 rounded-lg p-6 space-y-4 bg-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-default-900">
                FAQ {index + 1}
              </h3>
              {localFAQs.length > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFAQ(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Remove FAQ (minimum 3 required)"
                >
                  <TrashIcon className="size-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`faq-question-${index}`}>
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id={`faq-question-${index}`}
                name={`faq-question-${index}`}
                placeholder="Enter the question..."
                value={faq.question}
                onChange={(e) => updateFAQ(index, "question", e.target.value)}
                rows={2}
                className={`resize-none ${
                  showErrors && !faq.question.trim()
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {showErrors && !faq.question.trim() && (
                <p className="text-sm text-destructive">
                  Question is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`faq-answer-${index}`}>
                Answer <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id={`faq-answer-${index}`}
                name={`faq-answer-${index}`}
                placeholder="Enter the answer..."
                value={faq.answer}
                onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                rows={4}
                className={`resize-none ${
                  showErrors && !faq.answer.trim()
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {showErrors && !faq.answer.trim() && (
                <p className="text-sm text-destructive">
                  Answer is required
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addFAQ}
        disabled={localFAQs.length >= 15}
        className="w-full gap-2"
        title={localFAQs.length >= 15 ? "Maximum 15 FAQs allowed" : "Add Another FAQ"}
      >
        <PlusIcon className="size-4" />
        Add Another FAQ {localFAQs.length >= 15 ? "(Maximum reached)" : `(${localFAQs.length}/15)`}
      </Button>
      {localFAQs.length < 3 && (
        <p className="text-sm text-destructive text-center">
          Minimum 3 FAQs required. Please add {3 - localFAQs.length} more FAQ{3 - localFAQs.length !== 1 ? "s" : ""}.
        </p>
      )}
    </div>
  );
};

export const FAQs = React.forwardRef<FAQsHandle, FAQsProps>(FAQsInner);

