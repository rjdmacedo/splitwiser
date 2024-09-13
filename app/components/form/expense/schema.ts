import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

export const ExpenseUpsertSchema = zod.object({
  amount: zod.coerce.number().min(0, { message: "Amount must be greater than 0." }),
  description: zod.string({ message: "Please enter a description." }),
});

export const ExpenseUpsertResolver = zodResolver(ExpenseUpsertSchema);

export type ExpenseUpsertFormData = zod.infer<typeof ExpenseUpsertSchema>;
