import { UserPlusIcon } from "@heroicons/react/24/outline";
import React from "react";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { AddMemberForm } from "~/routes/resource.group.add-member";
import { cn } from "~/utils";

interface AddMembersToGroupProps {
  groupId: string;
  children?: React.ReactNode;
  className?: string;
}

export function AddMembersToGroupButton({ groupId, children = "Add members", className }: AddMembersToGroupProps) {
  return (
    <AddMembersToGroupDialog groupId={groupId}>
      <Button id={groupId} className={cn("w-full", className)}>
        <UserPlusIcon className="h-4 w-4 mr-2" />
        {children}
      </Button>
    </AddMembersToGroupDialog>
  );
}

function AddMembersToGroupDialog({ groupId, children }: { groupId: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add a member to the group</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AddMemberForm groupId={groupId} onCancel={close} onSuccess={close} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
