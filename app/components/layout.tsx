import {
  UserIcon,
  UserGroupIcon,
  PlusCircleIcon,
  UserCircleIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import React from "react";

import { Link, LinkProps } from "~/components/link";
import { cn } from "~/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="absolute flex h-full w-full min-h-screen flex-col">
      <main className="flex flex-col h-full bg-primary-foreground p-4">{children}</main>

      <nav className="relative p-4 bottom-0 flex h-16 bg-primary-background items-center border-t justify-between">
        <NavigationLink to="friends" title="Friends">
          <UserIcon className="h-5" />
        </NavigationLink>

        <NavigationLink to="groups" title="Groups">
          <UserGroupIcon className="h-5" />
        </NavigationLink>

        <PlusCircleIcon className="h-10" />

        <NavigationLink to="activity" title="Activity">
          <PresentationChartLineIcon className="h-5" />
        </NavigationLink>

        <NavigationLink to="profile" title="Profile">
          <UserCircleIcon className="h-5" />
        </NavigationLink>
      </nav>
    </div>
  );
}

function NavigationLink({ to, title, children }: LinkProps & { children: React.ReactNode; title?: string }) {
  return (
    <Link to={to} className={({ isActive }) => cn({ "font-bold": isActive })}>
      <PresentationIcon title={title}>{children}</PresentationIcon>
    </Link>
  );
}

interface PresentationIconProps {
  title?: string;
  children: React.ReactNode;
}

function PresentationIcon({ title, children }: PresentationIconProps) {
  return (
    <div className={cn("flex flex-col", { "gap-1": !!title })}>
      {children}
      {title ? <span className="text-xs">{title}</span> : null}
    </div>
  );
}
