import {
  UserIcon,
  UserGroupIcon,
  PlusCircleIcon,
  UserCircleIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { useHref, useParams } from "@remix-run/react";
import React from "react";

import { Link, LinkProps } from "~/components/link";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { group } = useParams<{ group?: string }>();
  const createExpenseHref = useHref(group ? `${group}/expense/create` : "/expense/create");

  return (
    <div className="relative flex min-h-screen flex-col">
      <main className="flex-grow">{children}</main>

      <nav className="sticky z-40 p-4 bottom-0 flex h-16 bg-background items-center border-t justify-between">
        <NavigationLink to="friends" title="Friends">
          <UserIcon className="h-5" />
        </NavigationLink>

        <NavigationLink to="groups" title="Groups">
          <UserGroupIcon className="h-5" />
        </NavigationLink>

        <Link to={createExpenseHref} className={buttonVariants({ size: "icon", variant: "ghost" })}>
          <PlusCircleIcon className="h-10" />
        </Link>

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
