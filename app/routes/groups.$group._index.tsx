import { CogIcon, TrashIcon, CameraIcon } from "@heroicons/react/24/outline";
import { ArrowTurnDownRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { type ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import React from "react";
import invariant from "tiny-invariant";

import { AddMembersToGroupButton } from "~/components/add-members-to-group-button";
import { GoBackIcon } from "~/components/go-back-icon";
import { Link } from "~/components/link";
import { PageHeader } from "~/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { getUserGroupDebts } from "~/models/debt.server";
import { getGroupById, updateGroup } from "~/models/group.server";
import { LeaveGroupButton } from "~/routes/resource.group.leave";
import { requireUserId } from "~/session.server";
import { cn, currencyFormatter, getUsersBalance, useUser } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `Group: ${data?.group.name}` }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params.group, "No group ID provided");

  const group = await getGroupById(params.group);
  const debt = await getUserGroupDebts(userId, params.group);

  invariant(group, `Group with id ${params.id} not found`);

  return json({ group, debt });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("here");
  const formData = await request.formData();
  const id = formData.get("group-id")!;
  const name = formData.get("group-name");

  invariant(typeof id === "string", "No group ID provided");

  if (typeof name !== "string" || name.length === 0) {
    return json({ errors: { body: null, name: "Name is required" } }, { status: 400 });
  }

  // Update the group
  await updateGroup(id, { name: name });

  return json(null, { status: 200 });
};

export default function GroupPage() {
  return (
    <>
      <PageHeader left={<GoBackIcon to="/groups" className="z-30" />} right={<GroupActions />}>
        <GroupWallpaper />
      </PageHeader>
      <div className="mt-44 space-y-3">
        <GroupTitle />
        <GroupExpensesTable />
      </div>
    </>
  );
}

function GroupActions() {
  const { group } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const haveDebt = getUsersBalance(group.expenses).some(({ balance }) => balance !== 0);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="icon" variant="ghost" className="z-30">
          <CogIcon className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Group definitions</DrawerTitle>
          <DrawerDescription>
            Here you can change the group name, add or remove members, or change the group image.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex flex-col space-y-3">
          <Form method="patch" action={`/groups/${group.id}`} className="w-full flex flex-col gap-1">
            <input name="group-id" defaultValue={group.id} hidden />
            <label htmlFor="group-name" className="text-sm">
              Group name
            </label>
            <div className="gap-2 flex w-full">
              <Input
                id="group-name"
                name="group-name"
                required
                placeholder="Group name"
                defaultValue={group.name}
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
              />
              <Button type="submit">Save</Button>
            </div>
            {actionData?.errors?.name ? (
              <div className="pt-1 text-sm text-destructive" id="name-error">
                {actionData.errors.name}
              </div>
            ) : null}
          </Form>
          <Separator />
          <GroupMembersSection />
          <AddMembersToGroupButton groupId={group.id} />
          <Separator />
          <GroupExpensesSection />
          <Separator />
          <div className="space-y-2">
            <span className="text-sm">Advanced settings</span>
            <LeaveGroupButton groupId={group.id} />
            {haveDebt ? (
              <span className="text-xs flex justify-center text-muted-foreground">
                You cant leave the group because you have debts with other group members.
              </span>
            ) : null}
            <Button variant="destructive" className="w-full">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete group
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function GroupWallpaper() {
  return (
    <div className="absolute h-32 inset-0">
      <div className="absolute bg-sky-600 rounded-2xl border-background border-4 left-4 -bottom-10 p-6">
        <AddGroupImageDrawer>
          <Button size="icon" variant="link">
            <CameraIcon className="h-8 w-8 text-background" />
          </Button>
        </AddGroupImageDrawer>
      </div>
    </div>
  );
}

function GroupTitle() {
  const user = useUser();
  const { debt, group } = useLoaderData<typeof loader>();
  const friends = group.members.filter((member) => member.userId !== user.id).length;

  let description = "";
  if (group.expenses.length < 1) description = "No expenses yet.";
  else if (debt.balance === 0) description = "You are all settled up";
  else if (debt.balance > 0) description = `You are owed a total of ${currencyFormatter(debt.balance)}`;
  else description = `You owe a total of ${currencyFormatter(debt.balance)}`;

  const redOrGreen = debt.balance < 0 ? "text-red-600" : "text-green-600";

  return (
    <div className="flex flex-col">
      <span className="text-3xl">{group.name}</span>
      <span className={cn({ redOrGreen: group.expenses.length > 0 })}>{description}</span>
      <div className="flex flex-col">
        {friends === 0 ? (
          <div className="flex justify-center items-center flex-col space-y-6 mt-32">
            <span className="text-xs ">You are the only one here</span>
            <AddMembersToGroupButton groupId={group.id} />
          </div>
        ) : null}
        {debt.members.map(({ id, name, balance }) => (
          <div key={id} className={cn("text-sm flex items-center gap-1", redOrGreen)}>
            <ArrowTurnDownRightIcon className="-mt-1.5 h-4 w-4 inline" />
            {balance > 0
              ? `${name} owes you ${currencyFormatter(balance)}.`
              : balance < 0
                ? `You owe ${name} ${currencyFormatter(balance)}.`
                : `You and ${name} are even.`}
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupExpensesTable() {
  const user = useUser();
  const {
    group: { expenses },
  } = useLoaderData<typeof loader>();

  return expenses.map((expense) => {
    const expensePaidByUser = expense.paidById === user.id;
    const redOrGreen = expensePaidByUser ? "text-green-600" : "text-red-600";

    return (
      <Link
        to={`/groups/${expense.groupId}/expenses/${expense.id}`}
        key={expense.id}
        className="flex items-center justify-between gap-4 p-2"
      >
        <span>{format(expense.createdAt, "MMM. d")}</span>
        <div className="flex-grow flex flex-col">
          <span className="text-lg">{expense.description}</span>
          <span className={cn("text-xs", redOrGreen)}>
            {expense.paidById === user.id ? "You" : expense.paidBy.name} paid {currencyFormatter(expense.amount)}
          </span>
        </div>
        <span className={cn("flex flex-col items-end", redOrGreen)}>
          <span className="text-xs">{expensePaidByUser ? "lent" : "borrowed"}</span>
          <span className="font-bold">
            {currencyFormatter(
              expensePaidByUser
                ? expense.splits.reduce((acc, split) => (split.userId === user.id ? acc : acc + split.amount), 0)
                : expense.splits.reduce((acc, split) => (split.userId === user.id ? acc + split.amount : acc), 0),
            )}
          </span>
        </span>
      </Link>
    );
  });
}

function AddGroupImageDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add group image</DrawerTitle>
          <DrawerDescription>Add a group image to make it easier to identify your group.</DrawerDescription>
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

function GroupMembersSection() {
  const { id } = useUser();
  const { group } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm">Group members</p>
        <span className="text-xs">
          {group.members.length > 0 ? `Total: ${group.members.length}` : "No members yet"}
        </span>
      </div>

      {group.members.length > 0 ? (
        <ul className="space-y-1">
          {group.members.map(({ user }) => (
            <li key={`member-${user.id}`} className="flex items-center">
              <span>
                {user.name}
                {user.id === id ? " (You)" : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GroupExpensesSection() {
  const { id } = useUser();
  const { group } = useLoaderData<typeof loader>();
  const usersBalance = getUsersBalance(group.expenses);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm">Group expenses</p>
        <span className="text-xs">
          {group.expenses.length > 0
            ? `Diff: ${usersBalance.reduce((acc, curr) => curr.balance + acc, 0).toFixed(2)}`
            : "No expenses yet"}
        </span>
      </div>

      <ul className="space-y-1">
        {usersBalance.map(({ user, balance }) => (
          <li key={`balance-${user.id}`} className="flex justify-between items-center">
            <span>
              {user.name}
              {user.id === id ? " (You)" : null}
            </span>
            <span
              className={cn({
                "text-red-600": balance < 0,
                "text-green-600": balance > 0,
              })}
            >
              {currencyFormatter(balance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
