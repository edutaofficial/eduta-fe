'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type UseStepperReturn } from '@/hooks/use-stepper';

// Context for sharing stepper state across components
interface StepperContextValue extends UseStepperReturn {}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext() {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
}

// Main Stepper Component
interface StepperProps {
  children: React.ReactNode;
  stepper: UseStepperReturn;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Stepper({
  children,
  stepper,
  className,
  orientation = 'horizontal',
}: StepperProps) {
  return (
    <StepperContext.Provider value={stepper}>
      <div
        className={cn(
          'stepper',
          orientation === 'horizontal' ? 'w-full' : 'flex flex-col',
          className
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// StepperItems - Container for step indicators
interface StepperItemsProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperItems({ children, className }: StepperItemsProps) {
  return (
    <ul
      className={cn(
        'relative flex flex-row gap-x-2',
        className
      )}
    >
      {children}
    </ul>
  );
}

// StepperItem - Individual step indicator
interface StepperItemProps {
  index: number;
  className?: string;
}

export function StepperItem({ index, className }: StepperItemProps) {
  const { steps, isStepComplete, isStepActive, goToStep } = useStepperContext();
  const step = steps[index];
  const isComplete = isStepComplete(index);
  const isActive = isStepActive(index);
  const isLast = index === steps.length - 1;

  if (!step) return null;

  return (
    <li className={cn('shrink basis-0 flex-1 group', className)}>
      <div className="min-w-7 min-h-7 w-full inline-flex items-center text-xs align-middle">
        <button
          type="button"
          onClick={() => goToStep(index)}
          className={cn(
            'size-7 flex justify-center items-center shrink-0 font-medium rounded-full transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
            isComplete && 'bg-primary text-primary-foreground hover:bg-primary/90',
            isActive && !isComplete && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
            !isActive && !isComplete && 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-label={`Go to ${step.label}`}
          aria-current={isActive ? 'step' : undefined}
        >
          {isComplete ? (
            <CheckIcon className="size-4" />
          ) : (
            <span>{index + 1}</span>
          )}
        </button>
        {!isLast && (
          <div
            className={cn(
              'ms-2 w-full h-px flex-1 transition-colors duration-200',
              isComplete ? 'bg-primary' : 'bg-border'
            )}
          />
        )}
      </div>
      <div className="mt-3">
        <span
          className={cn(
            'block text-sm font-medium transition-colors duration-200',
            isActive && 'text-foreground',
            !isActive && 'text-muted-foreground'
          )}
        >
          {step.label}
        </span>
        {step.description && (
          <span className="block text-xs text-muted-foreground mt-1">
            {step.description}
          </span>
        )}
        {step.optional && (
          <span className="block text-xs text-muted-foreground italic mt-0.5">
            Optional
          </span>
        )}
      </div>
    </li>
  );
}

// StepperContent - Container for step content
interface StepperContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperContent({ children, className }: StepperContentProps) {
  return (
    <div className={cn('mt-8 mb-8', className)}>
      {children}
    </div>
  );
}

// StepperPanel - Individual step content panel
interface StepperPanelProps {
  index: number;
  children: React.ReactNode;
  className?: string;
}

export function StepperPanel({ index, children, className }: StepperPanelProps) {
  const { currentStep } = useStepperContext();
  const isActive = currentStep === index;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`step-${index}`}
      className={cn('animate-in fade-in-50 duration-200', className)}
    >
      {children}
    </div>
  );
}

// StepperActions - Navigation buttons container
interface StepperActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperActions({ children, className }: StepperActionsProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {children}
    </div>
  );
}

// StepperPreviousButton - Previous step button
interface StepperPreviousButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function StepperPreviousButton({
  children = 'Previous',
  className,
  ...props
}: StepperPreviousButtonProps) {
  const { previousStep, canGoPrevious } = useStepperContext();

  return (
    <button
      type="button"
      onClick={previousStep}
      disabled={!canGoPrevious}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        'h-10 px-4 py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// StepperNextButton - Next step button
interface StepperNextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function StepperNextButton({
  children = 'Next',
  className,
  ...props
}: StepperNextButtonProps) {
  const { nextStep, canGoNext } = useStepperContext();

  return (
    <button
      type="button"
      onClick={nextStep}
      disabled={!canGoNext}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// StepperCompleteButton - Complete/Submit button
interface StepperCompleteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function StepperCompleteButton({
  children = 'Complete',
  className,
  ...props
}: StepperCompleteButtonProps) {
  const { isLastStep } = useStepperContext();

  if (!isLastStep) return null;

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
