"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-50/50 dark:text-gray-100 dark:hover:bg-gray-800/50"
      >
        <div className="flex-1">{title}</div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-400",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 p-5 dark:border-gray-800 animate-in fade-in-50 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("space-y-4 w-full", className)}>{children}</div>;
};
