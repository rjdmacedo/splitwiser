import React from "react";

import { cn } from "~/utils";

interface PageHeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageHeader({ left = null, right = null, className, children }: PageHeaderProps) {
  return (
    <div className={cn("container absolute h-32 inset-0 bg-sky-500", className)}>
      {left || right ? (
        <div className="flex justify-between pt-4 text-background">
          {left}
          {right}
        </div>
      ) : null}

      {children}
    </div>
  );
}
