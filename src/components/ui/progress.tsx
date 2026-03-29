import { cn } from "@/lib/utils";

export const Progress = ({
  value,
  className,
  variant = "default",
}: {
  value: number;
  className?: string;
  variant?: "default" | "success" | "warning" | "error";
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  const variantStyles = {
    default: "bg-[var(--electric)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    error: "bg-[var(--error)]",
  };
  
  return (
    <div className={cn("h-2 w-full rounded-full bg-[var(--dark-1)] overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          variantStyles[variant]
        )}
        style={{ 
          width: `${clampedValue}%`,
          transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
    </div>
  );
};
