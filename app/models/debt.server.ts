import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

interface FriendDebt {
  amount: number;
  friendId: string;
  friendName: string;
}

export async function getUserDebts(userId: string): Promise<FriendDebt[]> {
  // Fetch expenses with splits where the user has made payments
  const expenses = await prisma.expense.findMany({
    where: { payments: { some: { paidById: userId } } },
    include: { splits: { include: { user: true } }, payments: true },
  });

  // Calculate debts
  const debts: Record<string, FriendDebt> = {};

  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (split.userId !== userId) {
        const amountOwed = split.amount;
        if (!debts[split.userId]) {
          debts[split.userId] = {
            friendId: split.user.id,
            friendName: split.user.name,
            amount: 0,
          };
        }
        debts[split.userId].amount += amountOwed;
      }
    }
  }

  // Convert debts object to array
  return Object.values(debts);
}
export interface GroupDebt {
  groupId: string;
  balance: number;
  groupName: string;
  members: {
    id: string;
    name: string;
    email: string;
    balance: number;
  }[];
}

/**
 * aims to calculate the debt balances within groups where the user is a member.
 * @param userId the user id
 */
export async function getUserGroupsDebts(userId: string): Promise<GroupDebt[]> {
  // Fetch groups where the user is a member
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: true } },
      expenses: { include: { splits: true, payments: { include: { paidBy: true } } } },
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
      expense.splits.forEach((split) => {
        if (split.userId === userId) {
          // The user owes this amount to the payer
          const payerId = expense.payments.find((payment) => payment.paidById !== userId)?.paidById;
          if (payerId) {
            balances[payerId] = (balances[payerId] || 0) - split.amount;
            userBalance -= split.amount;
          }
        } else if (expense.payments.some((payment) => payment.paidById === userId)) {
          // The user paid this expense and other members owe the user
          balances[split.userId] = (balances[split.userId] || 0) + split.amount;
          userBalance += split.amount;
        }
      });
    });

    // Convert balances to members format
    const members = group.members
      .filter((member) => member.userId !== userId)
      .map((member) => ({
        id: member.userId,
        name: member.user.name,
        email: member.user.email,
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

export async function getUserGroupDebts(userId: string, groupId: string): Promise<GroupDebt> {
  // Fetch the group and include necessary related data
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: { include: { user: true } },
      expenses: { include: { splits: true, payments: { include: { paidBy: true } } } },
    },
  });

  invariant(group, `Group with id ${groupId} not found`);

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
    expense.splits.forEach((split) => {
      if (split.userId === userId) {
        // The user owes this amount to the payer
        const payerId = expense.payments.find((payment) => payment.paidById !== userId)?.paidById;
        if (payerId) {
          balances[payerId] = (balances[payerId] || 0) - split.amount;
          userBalance -= split.amount;
        }
      } else if (expense.payments.some((payment) => payment.paidById === userId)) {
        // The user paid this expense and other members owe the user
        balances[split.userId] = (balances[split.userId] || 0) + split.amount;
        userBalance += split.amount;
      }
    });
  });

  // Convert balances to members format
  const members = group.members
    .filter((member) => member.userId !== userId)
    .map((member) => ({
      id: member.userId,
      name: member.user.name,
      email: member.user.email,
      balance: Number((balances[member.userId] || 0).toFixed(2)), // Ensure the balance is a number
    }));

  return {
    groupId: group.id,
    groupName: group.name,
    balance: Number(userBalance.toFixed(2)), // Ensure the balance is a number
    members,
  };
}
