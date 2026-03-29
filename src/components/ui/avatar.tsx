"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
      "2xl": "h-20 w-20",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? "Avatar"}
          fill
          sizes="80px"
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <AvatarFallback size={size}>{fallback}</AvatarFallback>
      )}
    </span>
  )
);
Avatar.displayName = "Avatar";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { size?: VariantProps<typeof avatarVariants>["size"] }
>(({ className, children, size, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--electric)] to-[var(--purple)] font-medium text-white",
      size === "xs" && "text-[10px]",
      size === "sm" && "text-xs",
      size === "default" && "text-sm",
      size === "lg" && "text-base",
      size === "xl" && "text-lg",
      size === "2xl" && "text-xl",
      className
    )}
    {...props}
  >
    {children || "U"}
  </span>
));
AvatarFallback.displayName = "AvatarFallback";

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { limit?: number }
>(({ className, children, limit, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  const displayChildren = limit ? childrenArray.slice(0, limit) : childrenArray;
  const remaining = limit && childrenArray.length > limit ? childrenArray.length - limit : 0;

  return (
    <div ref={ref} className={cn("flex -space-x-2", className)} {...props}>
      {displayChildren.map((child, i) => (
        <div key={i} className="relative z-[var(--z-base)] hover:z-10">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <Avatar size="default">
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarFallback, AvatarGroup, avatarVariants };
