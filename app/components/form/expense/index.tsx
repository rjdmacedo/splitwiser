import { PlusIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useRemixForm } from "remix-hook-form";

import { Chip, ChipGroup } from "~/components/chip";
import { ExpenseProvider, strategyMapper, useExpenseContext } from "~/components/form/expense/context";
import { ExpenseFormProps } from "~/components/form/expense/expense";
import { ExpenseUpsertFormData, ExpenseUpsertSchema } from "~/components/form/expense/schema";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Drawer,
  DrawerTitle,
  DrawerHeader,
  DrawerFooter,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
} from "~/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, currencyFormatter, useUser } from "~/utils";

export function ExpenseForm({ members }: ExpenseFormProps) {
  return (
    <ExpenseProvider members={members}>
      <ExpenseFormContent />
    </ExpenseProvider>
  );
}

function ExpenseFormContent() {
  const user = useUser();
  const fetcher = useFetcher();
  const { members, strategy, expenseAmount, setExpenseAmount } = useExpenseContext();

  const form = useRemixForm<ExpenseUpsertFormData>({
    resolver: zodResolver(ExpenseUpsertSchema),
    defaultValues: { amount: 0, description: "" },
    submitHandlers: {
      onValid: (data) =>
        fetcher.submit(data, {
          method: "post",
          action: "/resource/expense?/upsert",
        }),
    },
  });

  const amount = form.watch("amount");

  React.useEffect(() => {
    if (amount <= 0) return;
    setExpenseAmount(amount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  return (
    <div className="space-y-5">
      <ChipGroup className="w-full justify-between items-start">
        <div className="flex gap-1 flex-wrap">
          {members.length > 0 ? (
            <Chip
              size="sm"
              label={`With all ${members.length} members`}
              onDelete={() => console.log("Delete")}
              avatar={
                <Avatar className="w-7 h-7">
                  <AvatarImage src="https://randomuser.me/api/portraits/thumb/women/2.jpg" alt="Avatar" />
                </Avatar>
              }
            />
          ) : null}
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="secondary" className="rounded-full">
            <PlusIcon className="w-6 h-6" />
          </Button>
        </div>
      </ChipGroup>

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
                  <Input {...field} min={0} type="number" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fetcher.Form>
      </Form>

      <div className={cn("flex justify-center items-center", { "text-muted-foreground": expenseAmount <= 0 })}>
        <fieldset disabled={expenseAmount <= 0 || members.length < 1}>
          Paid by <PaidByDrawer>{user.name}</PaidByDrawer> and divided{" "}
          <SplitStrategyDrawer>{strategy.type}</SplitStrategyDrawer>
        </fieldset>
      </div>
    </div>
  );
}

function PaidByDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">{children}</Button>
      </DrawerTrigger>
    </Drawer>
  );
}

function SplitStrategyDrawer({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const { split, members, strategy, expenseAmount, membersToSplit, setStrategyType, setMembersToSplit } =
    useExpenseContext();

  console.log({ split, membersToSplit });

  const computedHeader = "Divide " + strategyMapper[strategy.type].title;
  const computedDescription = strategyMapper[strategy.type].description;

  return (
    <Drawer dismissible={membersToSplit.length > 0}>
      <DrawerTrigger asChild>
        <Button size="sm">{children}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{computedHeader}</DrawerTitle>
          <DrawerDescription>{computedDescription}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Tabs value={strategy.type}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equally" onClick={() => setStrategyType("equally")}>
                Equally
              </TabsTrigger>
              <TabsTrigger value="byAmount" onClick={() => setStrategyType("byAmount")}>
                By amount
              </TabsTrigger>
              <TabsTrigger value="byPercentage" onClick={() => setStrategyType("byPercentage")}>
                By percentage
              </TabsTrigger>
            </TabsList>
            <TabsContent value="equally">
              <div className="gap-2 flex flex-col justify-between items-center">
                {members.map((member) => (
                  <React.Fragment key={`splits-${member.id}`}>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex-grow flex items-center gap-2">
                        <Avatar key={member.id} className="flex items-center">
                          <AvatarImage src="https://randomuser.me/api/portraits/thumb/men/1.jpg" alt="Avatar" />
                        </Avatar>
                        <span className={cn({ "font-bold": split[member.id] })}>
                          {member.name}
                          {user.id === member.id ? " (You)" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{currencyFormatter(split?.[member.id]?.amount || 0)}</span>
                        <Checkbox
                          checked={membersToSplit.some((memberId) => memberId === member.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMembersToSplit([...membersToSplit, member.id]);
                            } else {
                              setMembersToSplit(membersToSplit.filter((id) => id !== member.id));
                            }
                          }}
                        />
                      </div>
                    </div>
                    <Separator />
                  </React.Fragment>
                ))}
                <div className="w-full flex flex-col justify-center gap-2">
                  <DrawerDescription>Summary of this split.</DrawerDescription>

                  <div className="inline-flex items-center">
                    <UsersIcon className="w-5 h-5 mr-1" />
                    Expense total amount is {currencyFormatter(expenseAmount)}
                  </div>
                  <div
                    className={cn("inline-flex items-center", {
                      "text-destructive": membersToSplit.length === 0,
                    })}
                  >
                    <UserIcon className="w-5 h-5 mr-1" />
                    {membersToSplit.length > 0
                      ? `Each selected member pays ${currencyFormatter(expenseAmount / membersToSplit.length)}`
                      : "No members selected."}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
