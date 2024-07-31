import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon, ArrowTurnDownRightIcon } from "@heroicons/react/24/solid";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

import { Link } from "~/components/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Drawer,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
} from "~/components/ui/drawer";
import { getGroupDebts, GroupDebt } from "~/models/debt.server";
import { requireUserId } from "~/session.server";
import { cn, currencyFormatter } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Groups" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the user ID
  const userId = await requireUserId(request);
  // Get the debts
  const debts = await getGroupDebts(userId);
  // Calculate the balance
  const balance = debts.reduce((acc, debt) => acc + debt.balance, 0);

  return json({ debts, balance });
};

export default function AuthGroupsPage() {
  const { debts, balance } = useLoaderData<typeof loader>();

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end">
        <CreateGroupDrawer>
          <Button variant="ghost">Create group</Button>
        </CreateGroupDrawer>
      </div>

      <BalanceAndFilter balance={balance} />

      <div className="flex flex-col space-y-3">
        {debts.map(({ groupId, groupName, balance, members }) => (
          <Link to={groupId} key={groupId}>
            <Card className="flex flex-col p-4 space-y-1">
              <div className="font-bold flex items-center justify-between">
                {groupName}
                <span className={cn(balance >= 0 ? "text-green-600" : "text-red-600")}>
                  {currencyFormatter(balance)}
                </span>
              </div>

              <MembersList members={members} />
            </Card>
          </Link>
        ))}
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
          <DrawerDescription>Create a group to share expenses with your friends and family.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex flex-col items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
          <p>This feature is not yet implemented. Stay tuned!</p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function BalanceAndFilter({ balance }: { balance: GroupDebt["balance"] }) {
  return (
    <div className="flex justify-between my-6 text-2xl">
      <span>
        Balance:{" "}
        <span
          className={cn("font-bold", {
            "text-green-600": balance >= 0,
            "text-red-600": balance < 0,
          })}
        >
          {balance.toFixed(2)}€
        </span>
      </span>

      <Button size="icon" variant="ghost">
        <AdjustmentsHorizontalIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}

function MembersList({ members }: { members: GroupDebt["members"] }) {
  return (
    <div className="flex flex-col">
      {members.map(({ id, name, balance }) => (
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
  );
}
