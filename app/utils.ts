import { Expense, Split } from ".prisma/client";
import { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { User } from "~/models/user.server";
import { useRootLoaderData } from "~/root";
import { Debt } from "~/types";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

function isUser(user: unknown): user is User {
  return user != null && typeof user === "object" && "email" in user && typeof user.email === "string";
}

export function useOptionalUser() {
  const data = useRootLoaderData();
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currencyFormatter(amount: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates who owes how much to whom based on an array of expenses and their splits.
 *
 * @param expenses - An array of expense objects, each containing paidById and an array of splits.
 * @returns An array of debt objects showing the amount owed from one user to another.
 */
export function calculateDebts(expenses: Jsonify<(Expense & { splits: Split[] })[]>): Debt[] {
  const debts: Record<string, Record<string, number>> = {};

  expenses.forEach((expense) => {
    const { paidById, splits } = expense;

    splits.forEach((split) => {
      const { userId, amount } = split;

      if (userId !== paidById) {
        if (!debts[userId]) {
          debts[userId] = {};
        }

        if (!debts[userId][paidById]) {
          debts[userId][paidById] = 0;
        }

        debts[userId][paidById] += amount;
      }
    });
  });

  // Combine the debts into a flat array of Debt objects
  const debtArray: Debt[] = [];
  Object.keys(debts).forEach((fromUser) => {
    Object.keys(debts[fromUser]).forEach((toUser) => {
      const amount = debts[fromUser][toUser];
      if (amount > 0) {
        debtArray.push({
          from: fromUser,
          to: toUser,
          amount: parseFloat(amount.toFixed(2)),
        });
      }
    });
  });

  return debtArray;
}

interface PartialUser {
  id: string;
  name: string;
  email: string;
}

interface UserWithBalance {
  user: PartialUser;
  balance: number;
}

interface SplitWithUser {
  amount: number;
  userId: string;
  user: PartialUser;
}

interface ExpenseWithSplits {
  amount: number;
  date: string;
  description: string;
  groupId: string;
  id: string;
  paidById: string;
  splits: SplitWithUser[];
}

export function getUsersBalance(expenses: ExpenseWithSplits[]): UserWithBalance[] {
  const balances: Record<string, UserWithBalance> = {};

  expenses.forEach((expense) => {
    const { paidById, splits } = expense;

    splits.forEach((split) => {
      const { userId, amount } = split;

      if (!balances[userId]) {
        balances[userId] = {
          user: split.user,
          balance: 0,
        };
      }

      if (userId === paidById) {
        balances[userId].balance += expense.amount - amount;
      } else {
        balances[userId].balance -= amount;
      }
    });
  });

  return Object.values(balances);
}

export function getUserFirstLetters(name: string) {
  return name
    .split(" ")
    .map((name) => name[0])
    .join("");
}
