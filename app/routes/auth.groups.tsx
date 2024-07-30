import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { getUserDebts } from "~/models/debt.server";
import { requireUserId } from "~/session.server";
import { cn } from "~/utils";

export const loader = async (_: LoaderFunctionArgs) => {
  return json(null);
};

export default function AuthGroupsPage() {
  return (
    <span>
      <h1>Groups</h1>
    </span>
  );
}
