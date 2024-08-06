import { XMarkIcon } from "@heroicons/react/24/outline";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/utils";

const chipVariants = cva("inline-flex items-center p-1 rounded-full text-sm font-medium", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
      outline: "text-foreground border border-foreground shadow hover:bg-foreground/5",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-xl",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

type ChipProps = VariantProps<typeof chipVariants> &
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    icon?: React.ReactNode;
    avatar?: React.ReactNode;
    onClick?: () => void;
    onDelete?: () => void;
  };

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ label, icon, avatar, onClick, onDelete, variant, size, className, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent default action to avoid any scrolling or other side effects
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={cn(chipVariants({ variant, size }), className, { "cursor-pointer": onClick })}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        {...props}
      >
        {avatar ? <div className="mr-1">{avatar}</div> : null}
        {icon ? <div className="mr-1">{icon}</div> : null}
        <span className="px-1">{label}</span>
        {onDelete ? (
          <Button
            variant="ghost"
            className="h-6 w-6 p-1 rounded-full text-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        ) : null}
      </div>
    );
  },
);

Chip.displayName = "Chip";

type ChipGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
});

ChipGroup.displayName = "ChipGroup";
