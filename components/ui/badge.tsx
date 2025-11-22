import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none ] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-primary-400 text-primary-400",
        secondary: "border-secondary-400 text-secondary-400 bg-secondary-50",
        destructive: "border-error-400 text-error-400 bg-error-50",
        info: "border-warning-400 text-warning-400 bg-warning-50",
        success: "border-success-400 text-success-400 bg-success-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
