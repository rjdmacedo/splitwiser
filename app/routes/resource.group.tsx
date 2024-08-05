import { ArrowLeftStartOnRectangleIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { namedAction } from "remix-utils/named-action";
import invariant from "tiny-invariant";
import * as zod from "zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button, ButtonProps } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { addMemberToGroup, deleteGroup, removeMemberFromGroup } from "~/models/group.server";
import { requireGroupId, requireUserId } from "~/session.server";
import { cn } from "~/utils";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const groupId = await requireGroupId(request);

  return namedAction(request, {
    async leave() {
      try {
        await removeMemberFromGroup(groupId, userId);
        return redirect("/groups");
      } catch (error: unknown) {
        if (error instanceof Error) {
          return json({ success: false, error: error.message }, { status: 400 });
        }
        return json({ success: false, error: "An error occurred." });
      }
    },
    async delete() {
      try {
        await deleteGroup(groupId);
        return redirect("/groups");
      } catch (error: unknown) {
        if (error instanceof Error) {
          return json({ success: false, error: error.message }, { status: 400 });
        }
        return json({ success: false, error: "An error occurred." });
      }
    },
    async addMember() {
      const { data } = await getValidatedFormData<AddMembersToGroupFormData>(request, AddMembersToGroupResolver);
      invariant(data, "Data should be defined.");

      try {
        await addMemberToGroup(data.groupId, data.email);
        return json({ success: true, error: null });
      } catch (error: unknown) {
        {
          if (error instanceof Error) {
            return json({ success: false, error: error.message }, { status: 400 });
          }
          return json({ success: false, error: "An error occurred." });
        }
      }
    },
  });
}

/******************************** Delete Group ********************************/
interface DeleteGroupButtonProps extends ButtonProps {
  groupId: string;
}

export function DeleteGroupButton({ groupId, children = "Delete Group", className, ...rest }: DeleteGroupButtonProps) {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post" action="/resource/group?/delete">
      <input type="hidden" name="groupId" defaultValue={groupId} />
      <Button {...rest} type="submit" variant="destructive" className={cn("w-full", className)}>
        {children}
      </Button>
    </fetcher.Form>
  );
}
/******************************** Leave Group ********************************/
interface LeaveGroupButtonProps extends ButtonProps {
  groupId: string;
}

export function LeaveGroupButton({ groupId, children = "Leave Group", className, ...rest }: LeaveGroupButtonProps) {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post" action="/resource/group?/leave">
      <input type="hidden" name="groupId" defaultValue={groupId} />
      <Button {...rest} type="submit" variant="secondary" className={cn("w-full", className)}>
        <ArrowLeftStartOnRectangleIcon className="h-4 w-4 mr-2" />
        {children}
      </Button>
    </fetcher.Form>
  );
}
/******************************** Add Members ********************************/
interface AddMembersToGroupProps {
  groupId: string;
  children?: React.ReactNode;
  className?: string;
}

export function AddMembersToGroupButton({ groupId, className, children = "Add members" }: AddMembersToGroupProps) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button id={groupId} className={cn("w-full", className)}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          {children}
        </Button>
      </AlertDialogTrigger>
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

export function AddMemberForm({
  groupId,
  onCancel,
  onSuccess,
}: {
  groupId: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const fetcher = useFetcher<typeof action>();
  const form = useRemixForm<AddMembersToGroupFormData>({
    mode: "onSubmit",
    resolver: AddMembersToGroupResolver,
    defaultValues: { email: "", groupId },
    submitHandlers: {
      onValid: (data) =>
        fetcher.submit(data, {
          method: "post",
          action: "/resource/group?/addMember",
        }),
    },
  });

  const isSubmitting = fetcher.formAction === "/resource/group?/addMember";

  React.useEffect(() => {
    if (fetcher.data?.success) {
      form.reset();
      onSuccess();
    } else if (fetcher.data?.error) {
      form.setError("email", {
        type: "manual",
        message: fetcher.data.error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit} className="space-y-2">
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <fieldset disabled={isSubmitting} className="space-y-2">
          <Button type="submit" className="w-full">
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </fieldset>
      </fetcher.Form>
    </Form>
  );
}

const AddMembersToGroupSchema = zod.object({
  email: zod.string().email({
    message: "Please enter a valid email address.",
  }),
  groupId: zod.string(),
});

const AddMembersToGroupResolver = zodResolver(AddMembersToGroupSchema);

type AddMembersToGroupFormData = zod.infer<typeof AddMembersToGroupSchema>;
