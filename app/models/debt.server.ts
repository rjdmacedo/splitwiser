import { prisma } from "~/db.server";

interface FriendDebt {
  amount: number;
  friendId: string;
  friendName: string;
}

export async function getUserDebts(userId: string): Promise<FriendDebt[]> {
  // Fetch expenses paid by the user
  const paidExpenses = await prisma.expense.findMany({
    where: { paidById: userId },
    include: { splits: true },
  });

  // Calculate how much each friend owes the user
  const userOwed = paidExpenses.reduce(
    (acc, expense) => {
      expense.splits.forEach((split) => {
        if (split.userId !== userId) {
          acc[split.userId] = (acc[split.userId] || 0) + split.amount;
        }
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  // Fetch expenses where the user owes money
  const owedExpenses = await prisma.split.findMany({
    where: { userId: userId },
    include: {
      expense: {
        include: { paidBy: true },
      },
    },
  });

  // Calculate how much the user owes to each friend
  const userOwes = owedExpenses.reduce(
    (acc, split) => {
      const paidById = split.expense.paidById;
      if (paidById !== userId) {
        acc[paidById] = (acc[paidById] || 0) + split.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Combine the debts
  const combinedDebts: Record<string, number> = { ...userOwed };
  for (const friendId in userOwes) {
    combinedDebts[friendId] =
      (combinedDebts[friendId] || 0) - userOwes[friendId];
  }

  // Fetch friend names
  const friendDebts: FriendDebt[] = [];
  for (const friendId in combinedDebts) {
    const friend = await prisma.user.findUnique({ where: { id: friendId } });
    friendDebts.push({
      friendId,
      friendName: friend?.name || "Unknown",
      amount: combinedDebts[friendId],
    });
  }

  return friendDebts;
}

export interface GroupDebt {
  groupId: string;
  balance: number;
  groupName: string;
  members: {
    id: string;
    name: string;
    balance: number;
  }[];
}

export async function getGroupDebts(userId: string): Promise<GroupDebt[]> {
  // Fetch groups where the user is a member
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
      expenses: { include: { splits: true, paidBy: true } },
    },
  });

  // For each group, calculate to whom the user owes money and who owes money to the user
  return groups.map((group) => {
    const balances: Record<string, number> = {};

    // Initialize balances for each member
    group.members.forEach((member) => {
      if (member.userId !== userId) {
        balances[member.userId] = 0;
      }
    });

    let userBalance = 0;

    // Calculate balances based on expenses and splits
    group.expenses.forEach((expense) => {
      if (expense.paidById !== userId) {
        // If the expense was not paid by the user, check splits involving the user
        expense.splits.forEach((split) => {
          if (split.userId === userId) {
            // The user owes this amount to the payer
            balances[expense.paidById] =
              (balances[expense.paidById] || 0) - split.amount;
            userBalance -= split.amount;
          }
        });
      } else {
        // If the expense was paid by the user, check splits involving other users
        expense.splits.forEach((split) => {
          if (split.userId !== userId) {
            // Other user owes this amount to the current user
            balances[split.userId] =
              (balances[split.userId] || 0) + split.amount;
            userBalance += split.amount;
          }
        });
      }
    });

    // Convert balances to members format
    const members = group.members
      .filter((member) => member.userId !== userId)
      .map((member) => ({
        id: member.userId,
        name: member.user.name,
        balance: Number((balances[member.userId] || 0).toFixed(2)), // Ensure the balance is a number
      }));

    return {
      groupId: group.id,
      groupName: group.name,
      balance: Number(userBalance.toFixed(2)), // Ensure the balance is a number
      members,
    };
  });
}
