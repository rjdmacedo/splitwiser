import type { MetaFunction } from "@remix-run/node";

import { GoBackIcon } from "~/components/go-back-icon";
import { PageBody } from "~/components/page-body";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => [{ title: "Create Expense" }];

export default function ExpenseCreatePage() {
  return (
    <>
      <PageHeader left={<GoBackIcon to="/" />} right={<Button variant="secondary">Save</Button>} className="h-auto">
        <span className="text-2xl text-background">Create an expense</span>
      </PageHeader>
      <PageBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto assumenda delectus eaque, enim fuga ipsam
        minus molestias mollitia placeat reprehenderit. Asperiores beatae earum enim eos ipsum natus reiciendis? Enim,
        impedit!
      </PageBody>
    </>
  );
}
