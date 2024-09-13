import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";

import { Link } from "~/components/link";
import { PageBody } from "~/components/page-body";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import {
  Drawer,
  DrawerTitle,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
} from "~/components/ui/drawer";
import { UserAvatar } from "~/components/user-avatar";
import { calculateFriendBalances } from "~/models/friend.server";
import { requireUserId } from "~/session.server";
import { cn, currencyFormatter } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Friends" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const friends = await calculateFriendBalances(userId);

  return json({ friends });
};

export default function AuthFriendsPage() {
  const { friends } = useLoaderData<typeof loader>();

  console.log(
    JSON.stringify(
      friends.map((f) => ({
        name: f.name,
        balance: f.balance,
      })),
      null,
      2,
    ),
  );

  const totalBalance = friends.reduce((acc, friend) => acc + friend.balance, 0);

  return (
    <PageBody>
      <div className="w-full space-y-2">
        <div className="flex items-center justify-end">
          <AddFriendsDrawer>
            <Button variant="ghost">Add friends</Button>
          </AddFriendsDrawer>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-1">
            {totalBalance !== 0 ? <span>In total, you {totalBalance > 0 ? "are owed" : "owe"}:</span> : "Balance"}
            <span
              className={cn("font-bold", {
                "text-destructive": totalBalance < 0,
                "text-green-600": totalBalance >= 0,
              })}
            >
              {currencyFormatter(Math.abs(totalBalance))}
            </span>
          </div>
          {friends.map((friend) => (
            <Link to={`/friends/${friend.id}`} key={friend.id}>
              <Card>
                <CardHeader>
                  <UserAvatar name={friend.name}>
                    <div
                      className={cn("flex flex-col items-end", {
                        "text-green-600": friend.balance >= 0,
                        "text-destructive": friend.balance < 0,
                      })}
                    >
                      <span className="text-xs">
                        {friend.balance > 0 ? "You are owed" : friend.balance < 0 ? "You owe" : "Settled up"}
                      </span>
                      <span className="font-bold">{currencyFormatter(Math.abs(friend.balance))}</span>
                    </div>
                  </UserAvatar>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageBody>
  );
}

function AddFriendsDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add friends</DrawerTitle>
          <DrawerDescription>Add friends to start sharing expenses</DrawerDescription>
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
