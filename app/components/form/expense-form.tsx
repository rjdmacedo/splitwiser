import { PlusIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import React from "react";
import { useRemixForm } from "remix-hook-form";
import * as zod from "zod";

import { Chip, ChipGroup } from "~/components/chip";
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
import { action } from "~/routes/resource.group";
import { cn, currencyFormatter, useUser } from "~/utils";

interface ExpenseFormProps {
  groupId?: string;
  members?: User[];
}

interface Split {
  user: User;
  amount: number;
}

interface Strategy {
  type: StrategyType;
  splits: Split[];
}

export function ExpenseForm({ members }: ExpenseFormProps) {
  const user = useUser();
  const fetcher = useFetcher<typeof action>();
  const [strategy, setStrategy] = React.useState<Strategy>({ type: "equally", splits: [] });

  const form = useRemixForm<ExpenseUpsertFormData>({
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

  const amount = form.watch("amount");

  // const isSubmitting = fetcher.formAction === "/resource/expense?/upsert";

  return (
    <div className="space-y-5">
      <ChipGroup className="w-full justify-between items-start">
        <div className="flex gap-1 flex-wrap">
          {members && members.length > 0 ? (
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
                  <Input {...field} type="number" min={0} placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fetcher.Form>
      </Form>

      <div
        className={cn("flex justify-center items-center", {
          "text-muted-foreground": amount <= 0,
        })}
      >
        <fieldset disabled={amount <= 0}>
          Paid by <PaidByDrawer>{user.name}</PaidByDrawer> and divided{" "}
          <DividedStrategyDrawer
            amount={amount}
            members={members || []}
            onSelect={(strategy) => {
              console.log(strategy);
              setStrategy(strategy);
            }}
          >
            {strategyMapper[strategy.type].title}
          </DividedStrategyDrawer>
        </fieldset>
      </div>
    </div>
  );
}

const ExpenseUpsertSchema = zod.object({
  amount: zod.coerce.number().min(0, { message: "Amount must be greater than 0." }),
  description: zod.string({ message: "Please enter a description." }),
});

const ExpenseUpsertResolver = zodResolver(ExpenseUpsertSchema);

type ExpenseUpsertFormData = zod.infer<typeof ExpenseUpsertSchema>;

function PaidByDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">{children}</Button>
      </DrawerTrigger>
    </Drawer>
  );
}

type StrategyType = "equally" | "byAmount" | "byPercentage";

const strategyMapper: Record<StrategyType, { title: string; description: string }> = {
  equally: { title: "equally", description: "Divide the amount equally among the selected members." },
  byAmount: { title: "by amount", description: "Divide the amount by the specified amount." },
  byPercentage: { title: "by percentage", description: "Divide the amount by the specified percentage." },
};

function DividedStrategyDrawer({
  amount,
  members,
  children,
  onSelect,
}: {
  amount: number;
  members: User[];
  children: React.ReactNode;
  onSelect: (strategy: Strategy) => void;
}) {
  const user = useUser();
  const [splits, setSplits] = React.useState<Split[]>([]);
  const [strategyType, setStrategyType] = React.useState<StrategyType>("equally");
  const [membersToSplit, setMembersToSplit] = React.useState<User[]>(members);

  const computedHeader = "Divide " + strategyMapper[strategyType].title;
  const computedDescription = strategyMapper[strategyType].description;

  function calculateSplits() {
    switch (strategyType) {
      case "equally":
        // I want to refactor this component logic
        setSplits(
          membersToSplit.reduce<Split[]>(
            (acc, member) => [
              ...acc,
              {
                user: member,
                amount: amount / membersToSplit.length,
              },
            ],
            [],
          ),
        );
        break;
      case "byAmount":
        break;
      case "byPercentage":
        break;
    }
  }

  React.useEffect(() => {
    if (amount > 0) calculateSplits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, strategyType, membersToSplit]);

  return (
    <Drawer
      onClose={() => onSelect({ type: strategyType, splits })}
      dismissible={membersToSplit.length > 0}
      shouldScaleBackground
    >
      <DrawerTrigger asChild>
        <Button size="sm">{children}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{computedHeader}</DrawerTitle>
          <DrawerDescription>{computedDescription}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Tabs value={strategyType}>
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
                {members.map((member, idx) => (
                  <React.Fragment key={`splits-${member.id}`}>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex-grow flex items-center gap-2">
                        <Avatar key={member.id} className="flex items-center">
                          <AvatarImage src="https://randomuser.me/api/portraits/thumb/men/1.jpg" alt="Avatar" />
                        </Avatar>
                        <span className={cn({ "font-bold": user.id === member.id })}>
                          {member.name}
                          {user.id === member.id ? " (You)" : ""}
                        </span>
                      </div>
                      <Checkbox
                        checked={membersToSplit.some((m) => m.id === member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMembersToSplit((prev) => [...prev, member]);
                          } else {
                            setMembersToSplit((prev) => prev.filter((m) => m.id !== member.id));
                          }
                        }}
                      />
                    </div>
                    <Separator />
                  </React.Fragment>
                ))}

                <div className="w-full flex flex-col justify-center gap-2">
                  <DrawerDescription>Summary of this split.</DrawerDescription>
                  <div className="inline-flex items-center">
                    <UsersIcon className="w-5 h-5 mr-1" />
                    Expense total amount is {currencyFormatter(amount)}
                  </div>
                  <div
                    className={cn("inline-flex items-center", {
                      "text-destructive": membersToSplit.length === 0,
                    })}
                  >
                    <UserIcon className="w-5 h-5 mr-1" />
                    {membersToSplit.length > 0
                      ? `Each member pays ${currencyFormatter(amount / membersToSplit.length)}`
                      : "No members selected."}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="byAmount">By amount</TabsContent>
            <TabsContent value="byPercentage">By percentage</TabsContent>
          </Tabs>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
