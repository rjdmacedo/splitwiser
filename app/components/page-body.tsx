import React from "react";

import { cn } from "~/utils";

interface PageBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PageBody({ children, className }: PageBodyProps) {
  return <div className={cn("container mx-auto p-4", className)}>{children}</div>;
}
