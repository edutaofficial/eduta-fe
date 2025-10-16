import { useState, useCallback } from 'react';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export interface UseStepperOptions {
  initialStep?: number;
  steps: Step[];
  onStepChange?: (step: number) => void;
}

export interface UseStepperReturn {
  currentStep: number;
  steps: Step[];
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  isStepComplete: (stepIndex: number) => boolean;
  isStepActive: (stepIndex: number) => boolean;
}

/**
 * Custom hook for managing stepper state and navigation
 * @param options - Configuration options for the stepper
 * @returns Stepper state and control functions
 */
export function useStepper({
  initialStep = 0,
  steps,
  onStepChange,
}: UseStepperOptions): UseStepperReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrevious = currentStep > 0;

  const nextStep = useCallback(() => {
    if (canGoNext) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [canGoNext, currentStep, onStepChange]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [canGoPrevious, currentStep, onStepChange]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [steps.length, onStepChange]
  );

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    onStepChange?.(initialStep);
  }, [initialStep, onStepChange]);

  const isStepComplete = useCallback(
    (stepIndex: number) => {
      return stepIndex < currentStep;
    },
    [currentStep]
  );

  const isStepActive = useCallback(
    (stepIndex: number) => {
      return stepIndex === currentStep;
    },
    [currentStep]
  );

  return {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    goToStep,
    reset,
    isStepComplete,
    isStepActive,
  };
}

