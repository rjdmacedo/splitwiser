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

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

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

      <nav className="p-4 sticky bottom-0 flex h-14 bg-primary-background items-center border-t justify-between">
        <PresentationIcon title="Friends">
          <UserIcon className="h-5" />
        </PresentationIcon>
        <PresentationIcon title="Groups">
          <UserGroupIcon className="h-5" />
        </PresentationIcon>

        <PlusCircleIcon className="h-10" />

        <PresentationIcon title="Activity">
          <PresentationChartLineIcon className="h-5" />
        </PresentationIcon>
        <PresentationIcon title="Profile">
          <UserCircleIcon className="h-5" />
        </PresentationIcon>
      </nav>
    </div>
  );
}

interface PresentationIconProps {
  title?: string;
  children: React.ReactNode;
}

const PresentationIcon: FC<PresentationIconProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-1">
      {children}
      <span className="text-xs">{title}</span>
    </div>
  );
};
