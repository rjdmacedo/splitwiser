import React from "react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn, getUserFirstLetters } from "~/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size, children }) => {
  const avatarSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-10 h-10";
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  return (
    <div className={cn("flex items-center", { "justify-between": Boolean(children) })}>
      <div className={cn("flex items-center gap-3", textSize)}>
        <Avatar className={cn(avatarSize)}>
          <AvatarFallback>{getUserFirstLetters(name)}</AvatarFallback>
        </Avatar>
        {name}
      </div>

      {children}
    </div>
  );
};
