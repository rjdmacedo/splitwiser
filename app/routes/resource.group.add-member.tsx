import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import invariant from "tiny-invariant";
import * as zod from "zod";

import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { addMemberToGroup } from "~/models/group.server";
import { requireUser } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUser(request);

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
};

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
    resolver: AddMembersToGroupResolver,
    defaultValues: { email: "", groupId },
    submitHandlers: {
      onValid: (data) => {
        fetcher.submit(data, { method: "post", action: "/resource/group/add-member" });
      },
    },
  });

  const isSubmitting = fetcher.formAction === "/resource/group/add-member";

  React.useEffect(() => {
    if (fetcher.data?.success) {
      form.reset();
      onSuccess();
    } else if (fetcher.data?.error) {
      form.setError("email", { message: fetcher.data.error });
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

export const AddMembersToGroupResolver = zodResolver(AddMembersToGroupSchema);

export type AddMembersToGroupFormData = zod.infer<typeof AddMembersToGroupSchema>;
