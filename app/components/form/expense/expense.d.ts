import { User } from "@prisma/client";

type StrategyType = "equally" | "byAmount" | "byPercentage";

interface ExpenseFormProps {
  groupId?: string;
  members?: User[];
}

type Split = Record<
  string,
  {
    user: User;
    amount: number;
  }
>;

interface Strategy {
  type: StrategyType;
  split: Split;
}
