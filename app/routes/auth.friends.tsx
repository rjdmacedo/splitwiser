import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { getUserDebts } from "~/models/debt.server";
import { requireUserId } from "~/session.server";
import { cn } from "~/utils";

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
    <ul className="w-full">
      <div className="mb-6 text-2xl">
        Balance:{" "}
        <span
          className={cn("font-bold", {
            "text-green-600": balance >= 0,
            "text-red-600": balance < 0,
          })}
        >
          {balance.toFixed(2)}€
        </span>
      </div>

      {debts.map((debt) => (
        <li
          key={debt.friendId}
          className="flex items-center justify-between my-2"
        >
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
        </li>
      ))}
    </ul>
  );
}
