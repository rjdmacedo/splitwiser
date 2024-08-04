import { Prisma } from ".prisma/client";

import { prisma } from "~/db.server";

import ExpenseUpdateInput = Prisma.ExpenseUpdateInput;

export function getExpense(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: { splits: { include: { user: true } }, paidBy: true },
  });
}

export function destroyExpense(id: string) {
  return prisma.expense.delete({
    where: { id },
  });
}

export function updateExpense(id: string, data: ExpenseUpdateInput) {
  return prisma.expense.update({
    where: { id },
    data,
  });
}
