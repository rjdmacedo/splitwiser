import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ArrowTurnDownRightIcon } from "@heroicons/react/24/solid";
import { type ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { format } from "date-fns";
import invariant from "tiny-invariant";

import { GoBackIcon } from "~/components/go-back-icon";
import { PageBody } from "~/components/page-body";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/user-avatar";
import { destroyExpense, getExpense, updateExpense } from "~/models/expense.server";
import { requireUserId } from "~/session.server";
import { cn, currencyFormatter, useUser } from "~/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: `Expense: ${data?.expense.description}` }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  invariant(params.group, "No group ID provided");
  invariant(params.expense, "No expense ID provided");

  const expense = await getExpense(params.expense);

  invariant(expense, "Expense not found");

  return json({ expense });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.group, "No group ID provided");
  invariant(params.expense, "No expense ID provided");

  switch (request.method) {
    case "PATCH": {
      await updateExpense(params.expense, {
        amount: 1000,
        description: "New description",
      });
      break;
    }
    case "DELETE": {
      await destroyExpense(params.expense);
      return redirect(`/groups/${params.group}`);
    }
    default: {
      return json({ message: "Method not allowed" }, { status: 405 });
    }
  }
};

export default function ExpensePage() {
  const params = useParams();
  const user = useUser();
  const { expense } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader
        className="container"
        left={<GoBackIcon to={`/groups/${params.group}`} className="z-30" />}
        right={<GroupExpenseActions />}
      >
        <h1 className="text-lg text-background">{expense.description}</h1>
        <h3 className="text-2xl text-background">{currencyFormatter(expense.amount)}</h3>
      </PageHeader>
      <PageBody className="space-y-2">
        <div className="flex items-center">
          Added by {expense.paidBy.name} on {format(expense.createdAt, "MMM d, yyyy")}
        </div>

        <UserAvatar name={expense.paidBy.name}>paid {currencyFormatter(expense.amount)}</UserAvatar>
        <ul className="space-y-2">
          {expense.splits.map((split) => (
            <li
              key={split.id}
              className={cn("ml-2 flex justify-between items-center", {
                "font-bold": split.userId === user.id,
              })}
            >
              <div className="flex gap-2 items-center">
                <ArrowTurnDownRightIcon className="-mt-2 h-5 w-5" />
                <UserAvatar name={split.user.name} size="sm" />
              </div>
              <span>{currencyFormatter(split.amount)}</span>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}

function GroupExpenseActions() {
  return (
    <div className="flex">
      <Form method="patch">
        <Button size="icon" variant="ghost">
          <PencilSquareIcon className="h-6 w-6" />
        </Button>
      </Form>
      <Form method="delete">
        <Button size="icon" variant="ghost">
          <TrashIcon className="h-6 w-6" />
        </Button>
      </Form>
    </div>
  );
}
