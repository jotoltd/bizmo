"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
}

const AccordionContext = React.createContext<{
  openItems: Set<string>;
  toggleItem: (value: string) => void;
} | null>(null);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be wrapped in <Accordion>");
  }
  return context;
};

const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  type = "single", 
  collapsible = false,
  className 
}) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

  const toggleItem = React.useCallback((value: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        if (collapsible) {
          newSet.delete(value);
        }
      } else {
        if (type === "single") {
          newSet.clear();
        }
        newSet.add(value);
      }
      return newSet;
    });
  }, [type, collapsible]);

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const AccordionItemValueContext = React.createContext<string>("");

// Wrapper component that provides context
const AccordionItem: React.FC<AccordionItemProps> = ({ children, value, className }) => {
  return (
    <AccordionItemValueContext.Provider value={value}>
      <div className={cn("border border-[var(--border)] rounded-lg overflow-hidden", className)}>
        {children}
      </div>
    </AccordionItemValueContext.Provider>
  );
};

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className }, ref) => {
  const itemValue = React.useContext(AccordionItemValueContext);
  const { openItems, toggleItem } = useAccordion();
  const isOpen = openItems.has(itemValue);

  return (
    <button
      ref={ref}
      onClick={() => toggleItem(itemValue)}
      className={cn(
        "flex w-full items-center justify-between px-4 py-4 text-left transition-all",
        className
      )}
    >
      {children}
      <svg 
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionContent: React.FC<AccordionContentProps> = ({ children, className }) => {
  const itemValue = React.useContext(AccordionItemValueContext);
  const { openItems } = useAccordion();
  const isOpen = openItems.has(itemValue);

  if (!isOpen) return null;

  return (
    <div className={cn("px-4 pb-4", className)}>
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
