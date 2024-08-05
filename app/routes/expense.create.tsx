import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";

import { ExpenseForm } from "~/components/form/expense-form";
import { GoBackIcon } from "~/components/go-back-icon";
import { PageBody } from "~/components/page-body";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => [{ title: "Create Expense" }];

export const action = async (_: ActionFunctionArgs) => {};

export default function ExpenseCreatePage() {
  return (
    <>
      <PageHeader left={<GoBackIcon to="/" />} right={<Button variant="secondary">Save</Button>} className="h-auto">
        <span className="text-2xl text-background">Create an expense</span>
      </PageHeader>
      <PageBody>
        <ExpenseForm />
      </PageBody>
    </>
  );
}
