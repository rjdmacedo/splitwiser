import { CameraIcon } from "@heroicons/react/24/outline";
import { ArrowTurnDownRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import invariant from "tiny-invariant";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
} from "~/components/ui/drawer";
import { getUserGroupDebts } from "~/models/debt.server";
import { getGroupById } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { cn, currencyFormatter } from "~/utils";

// @ts-ignore
export const meta: MetaFunction = ({ data }) => [{ title: `Group: ${data.group.name}` }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params.id, "No group ID provided");

  const group = await getGroupById(params.id);
  const debt = await getUserGroupDebts(userId, params.id);

  invariant(group, "Group not found");

  return json({ group, debt });
};

export default function GroupPage() {
  const {
    group: { expenses },
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <GroupWallpaper />

      <div className="mt-40">
        <GroupTitle />
      </div>
    </div>
  );
}

function GroupWallpaper() {
  return (
    <div className="absolute h-32 inset-0 bg-teal-700">
      <div className="absolute bg-teal-600 rounded-2xl border-background border-4 left-4 -bottom-10 p-6">
        <AddGroupImageDrawer>
          <Button size="icon" variant="link">
            <CameraIcon className="h-8 w-8 text-background" />
          </Button>
        </AddGroupImageDrawer>
      </div>
    </div>
  );
}

function GroupTitle() {
  const { debt, group } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <span className="text-3xl">{group.name}</span>
      <span
        className={cn({
          "text-red-600": debt.balance < 0,
          "text-green-600": debt.balance > 0,
        })}
      >
        {debt.balance > 0
          ? `You are owed a total of ${currencyFormatter(debt.balance)}`
          : debt.balance < 0
            ? `You owe a total of ${currencyFormatter(debt.balance)}`
            : "You are all settled up"}
      </span>

      <div className="flex flex-col">
        {debt.members.map(({ id, name, balance }) => (
          <div
            key={id}
            className={cn(
              "text-sm flex items-center gap-1",
              {
                "text-green-600": balance > 0,
                "text-red-600": balance < 0,
                "text-gray-600": balance === 0,
              },
              {},
            )}
          >
            <ArrowTurnDownRightIcon className="-mt-1.5 h-4 w-4 inline" />
            {balance > 0
              ? `${name} owes you ${currencyFormatter(balance)}`
              : balance < 0
                ? `You owe ${name} ${currencyFormatter(balance)}`
                : "You're even"}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddGroupImageDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add group image</DrawerTitle>
          <DrawerDescription>Add a group image to make it easier to identify your group.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex flex-col items-center">
          <Alert variant="destructive" className="w-full">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Feature not implemented</AlertTitle>
            <AlertDescription>This feature is not implemented yet. Please come back later.</AlertDescription>
          </Alert>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
