"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--electric-muted)] text-[var(--electric)] border border-[var(--electric)]/20",
        primary:
          "bg-[var(--primary-500)]/20 text-[var(--primary-300)] border border-[var(--primary-500)]/30",
        secondary:
          "bg-[var(--dark-1)] text-[var(--text-secondary)] border border-[var(--border)]",
        success:
          "bg-[var(--success)]/20 text-[var(--success-light)] border border-[var(--success)]/30",
        warning:
          "bg-[var(--warning)]/20 text-[var(--warning-light)] border border-[var(--warning)]/30",
        error:
          "bg-[var(--error)]/20 text-[var(--error-light)] border border-[var(--error)]/30",
        info:
          "bg-[var(--info)]/20 text-[var(--info-light)] border border-[var(--info)]/30",
        purple:
          "bg-[var(--purple)]/20 text-[var(--purple-light)] border border-[var(--purple)]/30",
        outline:
          "border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      },
      size: {
        default: "h-6 px-2.5",
        sm: "h-5 px-2 text-[10px]",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
