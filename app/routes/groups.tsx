import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

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
import { getGroupDebts, getUserDebts } from "~/models/debt.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the user ID
  const userId = await requireUserId(request);
  // Get the debts
  const debts = await getGroupDebts(userId);

  return json({ debts });
};

export default function AuthGroupsPage() {
  const { debts } = useLoaderData<typeof loader>();
  console.log(debts);
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end">
        <CreateGroupDrawer>
          <Button variant="ghost">Create group</Button>
        </CreateGroupDrawer>
      </div>
    </div>
  );
}

function CreateGroupDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create group</DrawerTitle>
          <DrawerDescription>
            Create a group to share expenses with your friends and family.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex flex-col items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
          <p>This feature is not yet implemented. Stay tuned!</p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
