import { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

type GetUserFriendBalance = Prisma.UserFriendGetPayload<{
  include: {
    friend: {
      include: {
        groups: {
          include: {
            group: {
              include: {
                expenses: {
                  include: {
                    splits: { include: { user: true } };
                    payments: { include: { paidBy: true } };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>[];

export function getUserFriends(userId: string) {
  // Fetch friends with their related groups, expenses, splits, and payments
  return prisma.userFriend.findMany({
    where: { userId },
    include: {
      friend: {
        include: {
          groups: {
            include: {
              group: {
                include: {
                  expenses: {
                    include: {
                      splits: { include: { user: true } },
                      payments: { include: { paidBy: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function calculateFriendBalances(userId: string) {
  const userFriends = await getUserFriends(userId);

  return Promise.all(
    userFriends.map(async ({ friend }) => {
      let balance = 0;

      friend.groups.forEach(({ group }) => {
        group.expenses.forEach((expense) => {
          const splits = expense.splits.reduce(
            (acc, split) => {
              const paidAmount = expense.payments
                .filter((payment) => payment.paidById === split.userId)
                .reduce((sum, payment) => sum + payment.amount, 0);

              acc[split.userId] = {
                paid: paidAmount,
                shouldPay: split.amount,
                difference: split.amount - paidAmount,
              };
              return acc;
            },
            {} as Record<
              string,
              {
                paid: number;
                shouldPay: number;
                difference: number;
              }
            >,
          );

          const sumOfAllSplitsWithPositiveDifference = Object.values(splits)
            .filter((split) => split.difference > 0)
            .reduce((sum, split) => sum + split.difference, 0);

          const sumOfAllSplitsWithNegativeDifference = Object.values(splits)
            .filter((split) => split.difference < 0)
            .reduce((sum, split) => sum + split.difference, 0);

          const details: Record<
            string,
            {
              paid: number;
              shouldPay: number;
              difference: number;
              percentage: number;
            }
          > = {};

          Object.entries(splits).forEach(([userId, split]) => {
            const percentage =
              split.difference > 0
                ? split.difference / sumOfAllSplitsWithPositiveDifference
                : split.difference / sumOfAllSplitsWithNegativeDifference;

            details[userId] = {
              ...split,
              percentage,
            };
          });

          // Determine how many times each person has paid relative to their share
          const userOverpaid = details[userId].difference > 0;
          const friendOverpaid = details[friend.id].difference > 0;

          if (userOverpaid) {
            // User has overpaid
            if (!friendOverpaid) {
              // Friend has underpaid
              balance += details[friend.id].difference * details[userId].percentage;
            }
          } else if (!userOverpaid) {
            // User has underpaid
            if (friendOverpaid) {
              // Friend has overpaid
              balance -= details[userId].difference * details[friend.id].percentage;
            }
          }
        });
      });

      return {
        ...friend,
        balance,
      };
    }),
  );
}
// Calculate payment and split details for each user
function calculateExpenseDetails(expense: GetUserFriendBalance[0]["friend"]["groups"][0]["group"]["expenses"][0]) {
  return expense.splits.reduce(
    (acc, split) => {
      const paidAmount = expense.payments
        .filter((payment) => payment.paidById === split.userId)
        .reduce((sum, payment) => sum + payment.amount, 0);

      acc[split.userId] = {
        paid: paidAmount,
        shouldPay: split.amount,
        difference: split.amount - paidAmount,
      };

      return acc;
    },
    {} as Record<string, { paid: number; shouldPay: number; difference: number }>,
  );
}

// Calculate sums of differences and check if user or friend overpaid
function calculatePaymentDifferences(
  userId: string,
  friendId: string,
  expenseDetails: Record<string, { paid: number; shouldPay: number; difference: number }>,
) {
  let overpaidSum = 0;
  let underpaidSum = 0;
  let userOverpaid = false;
  let friendOverpaid = false;

  Object.entries(expenseDetails).forEach(([id, detail]) => {
    if (detail.difference > 0) {
      overpaidSum += detail.difference;
      if (id === userId) userOverpaid = true;
      if (id === friendId) friendOverpaid = true;
    } else if (detail.difference < 0) {
      underpaidSum += detail.difference;
    }
  });

  return {
    overpaidSum,
    underpaidSum,
    userOverpaid,
    friendOverpaid,
  };
}

// Adjust balance based on overpayment and underpayment
function calculateAdjustedBalance(
  balance: number,
  userId: string,
  friendId: string,
  overpaidSum: number,
  underpaidSum: number,
  userOverpaid: boolean,
  friendOverpaid: boolean,
  expenseDetails: Record<string, { paid: number; shouldPay: number; difference: number }>,
) {
  const userExpense = expenseDetails[userId];
  const friendExpense = expenseDetails[friendId];

  if (userOverpaid && !friendOverpaid) {
    balance -= friendExpense.difference * (userExpense.difference / overpaidSum);
  } else if (!userOverpaid && friendOverpaid) {
    balance += userExpense.difference * (friendExpense.difference / underpaidSum);
  }

  return balance;
}
