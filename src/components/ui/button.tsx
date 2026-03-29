"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--electric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--electric)] text-[var(--text-inverse)] hover:brightness-110 hover:shadow-[var(--shadow-glow-sm)]",
        primary:
          "bg-gradient-to-r from-[var(--electric)] to-[var(--primary-400)] text-[var(--text-inverse)] hover:brightness-110 hover:shadow-[var(--shadow-glow)]",
        secondary:
          "bg-[var(--dark-1)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--dark-2)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--dark-1)]",
        outline:
          "border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--electric)] hover:text-[var(--electric)] hover:bg-[var(--electric-muted)]",
        subtle:
          "bg-[var(--electric-muted)] text-[var(--electric)] hover:bg-[var(--electric)]/20",
        danger:
          "bg-[var(--error)] text-white hover:bg-[var(--error-dark)] hover:shadow-lg",
        success:
          "bg-[var(--success)] text-white hover:bg-[var(--success-dark)]",
        glass:
          "glass text-[var(--text-primary)] hover:bg-[var(--glass)]/80 hover:border-[var(--glass-border)]",
        link:
          "text-[var(--electric)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
