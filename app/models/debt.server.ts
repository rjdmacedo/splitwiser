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
