"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center",
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    let x = 0;
    let y = 0;

    switch (side) {
      case "top":
        y = rect.top - 8;
        x = align === "start" ? rect.left : align === "end" ? rect.right : rect.left + rect.width / 2;
        break;
      case "bottom":
        y = rect.bottom + 8;
        x = align === "start" ? rect.left : align === "end" ? rect.right : rect.left + rect.width / 2;
        break;
      case "left":
        x = rect.left - 8;
        y = rect.top + rect.height / 2;
        break;
      case "right":
        x = rect.right + 8;
        y = rect.top + rect.height / 2;
        break;
    }

    setPosition({ x, y });
  };

  const getTransform = () => {
    switch (side) {
      case "top":
        return "translate(-50%, -100%)";
      case "bottom":
        return "translate(-50%, 0)";
      case "left":
        return "translate(-100%, -50%)";
      case "right":
        return "translate(0, -50%)";
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "fixed z-[var(--z-tooltip)] px-3 py-1.5 rounded-md text-sm",
            "glass-panel text-[var(--text-primary)] animate-fade-in",
            "pointer-events-none"
          )}
          style={{
            left: position.x,
            top: position.y,
            transform: getTransform(),
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

export { Tooltip };
