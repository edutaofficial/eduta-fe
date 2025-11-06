"use client";

import * as React from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";

interface CourseAccordionContextValue {
  type: "single" | "multiple";
  value: string[];
  onValueChange: (value: string[]) => void;
}

const CourseAccordionContext = React.createContext<
  CourseAccordionContextValue | undefined
>(undefined);

interface CourseAccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

const CourseAccordion = React.forwardRef<HTMLDivElement, CourseAccordionProps>(
  (
    {
      type = "multiple",
      defaultValue = [],
      value: controlledValue,
      onValueChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState<string[]>(defaultValue);
    const value = controlledValue ?? uncontrolledValue;

    const handleValueChange = React.useCallback(
      (newValue: string[]) => {
        if (type === "single") {
          const singleValue =
            newValue.length > 0 ? [newValue[newValue.length - 1]] : [];
          onValueChange?.(singleValue);
          setUncontrolledValue(singleValue);
        } else {
          onValueChange?.(newValue);
          setUncontrolledValue(newValue);
        }
      },
      [onValueChange, type]
    );

    return (
      <CourseAccordionContext.Provider
        value={{
          type,
          value,
          onValueChange: handleValueChange,
        }}
      >
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </CourseAccordionContext.Provider>
    );
  }
);

CourseAccordion.displayName = "CourseAccordion";

interface CourseAccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  variant?: "section" | "lecture";
}

const CourseAccordionItemContext = React.createContext<
  { value: string } | undefined
>(undefined);

const CourseAccordionItem = React.forwardRef<
  HTMLDivElement,
  CourseAccordionItemProps
>(({ value, children, className, variant = "section", ...props }, ref) => {
  const context = React.useContext(CourseAccordionContext);
  if (!context) {
    throw new Error("CourseAccordionItem must be used within CourseAccordion");
  }

  return (
    <CourseAccordionItemContext.Provider value={{ value }}>
      <div
        ref={ref}
        className={cn(
          "rounded-lg ",
          variant === "section" ? "bg-primary-50" : "bg-primary-100 ",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CourseAccordionItemContext.Provider>
  );
});

CourseAccordionItem.displayName = "CourseAccordionItem";

interface CourseAccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "section" | "lecture";
  onClose?: () => void;
}

const CourseAccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  CourseAccordionTriggerProps
>(({ children, className, variant = "section", onClose, ...props }, ref) => {
  const context = React.useContext(CourseAccordionContext);
  if (!context) {
    throw new Error(
      "CourseAccordionTrigger must be used within CourseAccordion"
    );
  }

  const itemContext = React.useContext(CourseAccordionItemContext);
  if (!itemContext) {
    throw new Error(
      "CourseAccordionTrigger must be used within CourseAccordionItem"
    );
  }

  const { value } = itemContext;
  const isOpen = context.value.includes(value);

  const toggle = () => {
    if (isOpen) {
      context.onValueChange(context.value.filter((item) => item !== value));
    } else {
      context.onValueChange([...context.value, value]);
    }
  };

  return (
    <div className="relative flex w-full">
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-all",
          variant === "section"
            ? "bg-primary-50 hover:bg-primary-100"
            : "bg-primary-100 hover:bg-primary-200",
          className
        )}
        {...props}
      >
        {children}
        <div className="flex items-center gap-2">
          {onClose && (
            <>
              <div className="w-4" />
              <Separator
                orientation="vertical"
                className="h-6 w-[0.0625rem] bg-muted-foreground/20"
              />
            </>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>
      {onClose && (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }
          }}
          className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:text-destructive transition-colors outline-none cursor-pointer"
          aria-label="Remove item"
        >
          <XIcon className="size-4" />
        </div>
      )}
    </div>
  );
});

CourseAccordionTrigger.displayName = "CourseAccordionTrigger";

interface CourseAccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CourseAccordionContent = React.forwardRef<
  HTMLDivElement,
  CourseAccordionContentProps
>(({ children, className, ...props }, ref) => {
  const context = React.useContext(CourseAccordionContext);
  if (!context) {
    throw new Error(
      "CourseAccordionContent must be used within CourseAccordion"
    );
  }

  const itemContext = React.useContext(CourseAccordionItemContext);
  if (!itemContext) {
    throw new Error(
      "CourseAccordionContent must be used within CourseAccordionItem"
    );
  }

  const { value } = itemContext;
  const isOpen = context.value.includes(value);

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
        className
      )}
      {...props}
    >
      <div className={cn(isOpen ? "py-4" : "", className)}>{children}</div>
    </div>
  );
});

CourseAccordionContent.displayName = "CourseAccordionContent";

export {
  CourseAccordion,
  CourseAccordionItem,
  CourseAccordionTrigger,
  CourseAccordionContent,
};
