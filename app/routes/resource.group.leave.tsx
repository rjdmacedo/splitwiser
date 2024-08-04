import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button, ButtonProps } from "~/components/ui/button";
import { removeMemberFromGroup } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { cn } from "~/utils";

interface LeaveGroupButtonProps extends ButtonProps {
  groupId: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const groupId = formData.get("groupId") as string;

  invariant(groupId, "Data should be defined.");

  try {
    await removeMemberFromGroup(groupId, userId);
    return redirect("/groups");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({ success: false, error: error.message }, { status: 400 });
    }
    return json({ success: false, error: "An error occurred." });
  }
};

export function LeaveGroupButton({ groupId, children = "Leave Group", className, ...rest }: LeaveGroupButtonProps) {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post" action="/resource/group/leave">
      <input type="hidden" name="groupId" defaultValue={groupId} />
      <Button {...rest} type="submit" variant="secondary" className={cn("w-full", className)}>
        <ArrowLeftStartOnRectangleIcon className="h-4 w-4 mr-2" />
        {children}
      </Button>
    </fetcher.Form>
  );
}
