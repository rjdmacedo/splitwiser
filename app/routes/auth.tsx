import {
  UserIcon,
  UserGroupIcon,
  UserCircleIcon,
  PlusCircleIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import React, { FC } from "react";

import { Link, LinkProps } from "~/components/link";
import { requireUserId } from "~/session.server";
import { cn, useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  return json(null);
};

export default function AuthPage() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <main className="flex flex-col h-full bg-primary-foreground p-4">
        <h3 className="mb-2 text-lg">Welcome to Splitwiser, {user.name}</h3>
        <Outlet />
      </main>

      <nav className="p-4 sticky bottom-0 flex h-16 bg-primary-background items-center border-t justify-between">
        <NavigationLink to="/auth/friends" title="Friends">
          <UserIcon className="h-5" />
        </NavigationLink>

        <NavigationLink to="/auth/groups" title="Groups">
          <UserGroupIcon className="h-5" />
        </NavigationLink>

        <PlusCircleIcon className="h-10" />

        <NavigationLink to="/auth/activity" title="Activity">
          <PresentationChartLineIcon className="h-5" />
        </NavigationLink>

        <NavigationLink to="/auth/profile" title="Profile">
          <UserCircleIcon className="h-5" />
        </NavigationLink>
      </nav>
    </div>
  );
}

export function NavigationLink({
  to,
  title,
  children,
}: LinkProps & { children: React.ReactNode; title?: string }) {
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

const PresentationIcon: FC<PresentationIconProps> = ({ title, children }) => {
  return (
    <div className={cn("flex flex-col", { "gap-1": !!title })}>
      {children}
      {title ? <span className="text-xs">{title}</span> : null}
    </div>
  );
};
