"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseDetails } from "./CourseCreation/CourseDetails";
import { Curriculum } from "./CourseCreation/Curriculum";
import { Price } from "./CourseCreation/Price";
import { Finalize } from "./CourseCreation/Finalize";
import { Separator } from "@radix-ui/react-separator";

const STEPS = [
  { id: 1, name: "Course Details", component: CourseDetails },
  { id: 2, name: "Curriculum", component: Curriculum },
  { id: 3, name: "Price", component: Price },
  { id: 4, name: "Finalize", component: Finalize },
] as const;

export function CourseCreationWizard() {
  const [currentStep, setCurrentStep] = React.useState(1);
  type Validatable = { validateAndFocus: () => Promise<boolean> };
  const detailsRef = React.useRef<Validatable>(null as unknown as Validatable);
  const curriculumRef = React.useRef<Validatable>(
    null as unknown as Validatable
  );
  const priceRef = React.useRef<Validatable>(null as unknown as Validatable);
  const finalizeRef = React.useRef<Validatable>(null as unknown as Validatable);
  const router = useRouter();

  const goToNext = async () => {
    if (currentStep >= STEPS.length) return;
    let ok = true;
    if (currentStep === 1)
      ok = (await detailsRef.current?.validateAndFocus()) ?? true;
    if (currentStep === 2)
      ok = (await curriculumRef.current?.validateAndFocus()) ?? true;
    if (currentStep === 3)
      ok = (await priceRef.current?.validateAndFocus()) ?? true;
    if (currentStep === 4)
      ok = (await finalizeRef.current?.validateAndFocus()) ?? true;
    if (!ok) return;
    setCurrentStep(currentStep + 1);
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // no-op

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-default-900 mb-6">
          Create a Course
        </h1>
        <Separator className="h-[1px] w-full bg-default-400 mb-10" />

        {/* Steps Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center gap-2 ${
                  currentStep >= step.id
                    ? "text-primary-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`size-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= step.id
                      ? "border-primary-600 bg-primary-50"
                      : "border-default-300 bg-white"
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {step.name}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    currentStep > step.id ? "bg-primary-600" : "bg-default-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 1 ? (
            <CourseDetails ref={detailsRef} />
          ) : currentStep === 2 ? (
            <Curriculum ref={curriculumRef} />
          ) : currentStep === 3 ? (
            <Price ref={priceRef} />
          ) : (
            <Finalize ref={finalizeRef} />
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>

            <div className="flex gap-3">
              {currentStep === STEPS.length ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/instructor/courses")}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={async () => {
                      const ok = await finalizeRef.current?.validateAndFocus();
                      if (ok) {
                        // Handle successful save
                        // eslint-disable-next-line no-console
                        console.log("Ready to publish!");
                      }
                    }}
                  >
                    Save & Publish
                  </Button>
                </>
              ) : (
                <Button onClick={goToNext} className="gap-2">
                  Next
                  <ChevronRightIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
