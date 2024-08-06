import { User } from "@prisma/client";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { ExpenseForm } from "~/components/form/expense-form";
import { GoBackIcon } from "~/components/go-back-icon";
import { PageBody } from "~/components/page-body";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => [{ title: "Create Expense" }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const groupId = params.group;

  let group;
  if (groupId) {
    group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { select: { user: true } } },
    });
  }

  return json({ userId, group });
};

// export const action = async (_: ActionFunctionArgs) => {};

export default function ExpenseCreatePage() {
  const { group } = useLoaderData<typeof loader>();

  const members = group?.members.map((m) => m.user) as unknown as User[];

  return (
    <>
      <PageHeader left={<GoBackIcon to="/" />} right={<Button variant="secondary">Save</Button>} className="h-auto">
        <span className="text-2xl text-background">Create an expense</span>
      </PageHeader>
      <PageBody>
        <ExpenseForm groupId={group?.id} members={members} />
      </PageBody>
    </>
  );
}
