import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useRemixForm } from "remix-hook-form";
import * as zod from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { action } from "~/routes/resource.group";

export function ExpenseForm() {
  const fetcher = useFetcher<typeof action>();
  const form = useRemixForm<ExpenseUpsertFormData>({
    mode: "onSubmit",
    resolver: ExpenseUpsertResolver,
    defaultValues: { amount: 0, description: "" },
    submitHandlers: {
      onValid: (data) =>
        fetcher.submit(data, {
          method: "post",
          action: "/resource/expense?/upsert",
        }),
    },
  });

  // const isSubmitting = fetcher.formAction === "/resource/expense?/upsert";

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit} className="space-y-2">
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Add a description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </fetcher.Form>
    </Form>
  );
}

const ExpenseUpsertSchema = zod.object({
  amount: zod.number({ message: "Please enter a valid amount." }),
  description: zod.string({ message: "Please enter a description." }),
});

const ExpenseUpsertResolver = zodResolver(ExpenseUpsertSchema);

type ExpenseUpsertFormData = zod.infer<typeof ExpenseUpsertSchema>;
