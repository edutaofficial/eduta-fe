"use client";

import * as React from "react";
import {
  CourseAccordion,
  CourseAccordionItem,
  CourseAccordionTrigger,
  CourseAccordionContent,
} from "@/components/ui/course-accordion";

/**
 * Reusable Curriculum Accordion Component
 * 
 * A specialized accordion wrapper for curriculum items (sections and lectures)
 * with proper state management and accessibility features.
 * 
 * Features:
 * - Controlled open/close state
 * - Support for single or multiple open items
 * - Remove button integration
 * - Keyboard navigation
 * - Proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <CurriculumAccordion
 *   type="multiple"
 *   openItems={openSections}
 *   onOpenItemsChange={setOpenSections}
 * >
 *   {items.map((item, index) => (
 *     <CurriculumAccordionItem
 *       key={item.id}
 *       value={`item-${item.id}`}
 *       variant="section"
 *       title={`Section ${index + 1}`}
 *       canRemove={items.length > 1}
 *       onRemove={() => handleRemove(item.id)}
 *     >
 *       <div>Content goes here</div>
 *     </CurriculumAccordionItem>
 *   ))}
 * </CurriculumAccordion>
 * ```
 */

interface CurriculumAccordionProps {
  type?: "single" | "multiple";
  openItems: string[];
  onOpenItemsChange: (items: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

export function CurriculumAccordion({
  type = "multiple",
  openItems,
  onOpenItemsChange,
  children,
  className,
}: CurriculumAccordionProps) {
  return (
    <CourseAccordion
      type={type}
      value={openItems}
      onValueChange={onOpenItemsChange}
      className={className}
    >
      {children}
    </CourseAccordion>
  );
}

interface CurriculumAccordionItemProps {
  value: string;
  variant: "section" | "lecture";
  title: React.ReactNode;
  canRemove?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function CurriculumAccordionItem({
  value,
  variant,
  title,
  canRemove = false,
  onRemove,
  children,
  className,
}: CurriculumAccordionItemProps) {
  return (
    <CourseAccordionItem
      value={value}
      variant={variant}
      className={className}
    >
      <CourseAccordionTrigger
        variant={variant}
        onClose={canRemove ? onRemove : undefined}
      >
        {title}
      </CourseAccordionTrigger>
      
      <CourseAccordionContent>
        {children}
      </CourseAccordionContent>
    </CourseAccordionItem>
  );
}

// Export types for external use
export type { CurriculumAccordionProps, CurriculumAccordionItemProps };

