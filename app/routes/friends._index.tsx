import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

import { Link } from "~/components/link";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { getUserDebts } from "~/models/debt.server";
import { requireUserId } from "~/session.server";
import { cn } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Friends" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the user ID
  const userId = await requireUserId(request);
  // Get the debts
  const debts = await getUserDebts(userId);
  // Calculate the balance
  const balance = debts.reduce((acc, debt) => acc + debt.amount, 0);

  return json({ debts, balance });
};

export default function AuthFriendsPage() {
  const { debts, balance } = useLoaderData<typeof loader>();

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end">
        <AddFriendsDrawer>
          <Button variant="ghost">Add friends</Button>
        </AddFriendsDrawer>
      </div>

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

      <div className="flex flex-col space-y-3">
        {debts.map((debt) => (
          <Link to={debt.friendId} key={debt.friendId}>
            <Card className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-muted-foreground">
                    {debt.friendName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {debt.friendName}
              </div>
              <div>
                {debt.amount > 0 ? (
                  <Badge className="bg-green-600">
                    + {debt.amount.toFixed(2)}€
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    - {Math.abs(debt.amount).toFixed(2)}€
                  </Badge>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AddFriendsDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add friends</DrawerTitle>
          <DrawerDescription>
            Add friends to start sharing expenses
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
