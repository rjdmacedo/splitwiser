import { User } from "@prisma/client";
import React from "react";

import { Split, Strategy, StrategyType } from "~/components/form/expense/expense";

interface ExpenseContextType {
  split: Split;
  members: User[];
  strategy: Strategy;
  expenseAmount: number;
  membersToSplit: string[];
  setStrategyType: React.Dispatch<React.SetStateAction<StrategyType>>;
  setExpenseAmount: React.Dispatch<React.SetStateAction<number>>;
  setMembersToSplit: React.Dispatch<React.SetStateAction<string[]>>;
  calculateSplits: () => void;
}

const ExpenseContext = React.createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children, members = [] }: { children: React.ReactNode; members?: User[] }) => {
  const [split, setSplit] = React.useState<Split>({});
  const [strategy, setStrategy] = React.useState<Strategy>({ type: "equally", split: {} });
  const [strategyType, setStrategyType] = React.useState<StrategyType>("equally");
  const [expenseAmount, setExpenseAmount] = React.useState(0);
  const [membersToSplit, setMembersToSplit] = React.useState<string[]>(members.map((m) => m.id) || []);

  const calculateSplits = React.useMemo(() => {
    return () => {
      switch (strategyType) {
        case "equally": {
          const totalMembers = membersToSplit.length;
          const baseAmount = expenseAmount / totalMembers; // Base amount per member
          const splitResult: Split = {};
          let remainingAmount = Number(expenseAmount);

          membersToSplit.forEach((memberId, index) => {
            const finalAmount = Number(
              index === totalMembers - 1 ? remainingAmount : Math.floor(baseAmount * 100) / 100,
            );
            remainingAmount -= finalAmount;
            splitResult[memberId] = {
              user: members.find((m) => m.id === memberId) as User,
              amount: parseFloat(finalAmount.toFixed(2)),
            };
          });

          setSplit(splitResult);
          break;
        }
        case "byAmount":
          break;
        case "byPercentage":
          break;
        default:
          break;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyType, expenseAmount, membersToSplit]);

  /**
   * Update the strategy type when the user selects a different strategy
   */
  React.useEffect(() => {
    setStrategy((prev) => ({ ...prev, type: strategyType }));
  }, [strategyType]);

  /**
   * Calculate the splits when the expense amount or members to split change
   */
  React.useEffect(() => {
    if (Number(expenseAmount) > 0) calculateSplits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseAmount, membersToSplit]);

  return (
    <ExpenseContext.Provider
      value={{
        split,
        members: members || [],
        strategy,
        expenseAmount,
        membersToSplit,
        setExpenseAmount,
        setStrategyType,
        setMembersToSplit,
        calculateSplits,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => {
  const context = React.useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
};

export const strategyMapper: Record<StrategyType, { title: string; description: string }> = {
  equally: { title: "equally", description: "Divide the amount equally among the selected members." },
  byAmount: { title: "by amount", description: "Divide the amount by the specified amount." },
  byPercentage: { title: "by percentage", description: "Divide the amount by the specified percentage." },
};
