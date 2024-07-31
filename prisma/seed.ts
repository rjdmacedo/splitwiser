import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = {
    ana: "ana@mail.com",
    rafael: "rafael@mail.com",
    john: "john@mail.com",
  };

  // delete all users from the database
  for (const key in email) {
    await prisma.user.delete({ where: { email: email[key as keyof typeof email] } }).catch(() => {
      // no worries if it doesn't exist yet
    });
  }

  const hashedPassword = await bcrypt.hash("password", 10);

  const rafael = await prisma.user.create({
    data: {
      name: "Rafael Macedo",
      email: email.rafael,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: "Ana Ferreira",
      email: email.ana,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const john = await prisma.user.create({
    data: {
      name: "John Doe",
      email: email.john,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  // Create friendships between Rafael, Ana, and John
  await prisma.userFriend.createMany({
    data: [
      { userId: rafael.id, friendId: ana.id },
      { userId: ana.id, friendId: rafael.id },
      { userId: rafael.id, friendId: john.id },
      { userId: john.id, friendId: rafael.id },
      { userId: ana.id, friendId: john.id },
      { userId: john.id, friendId: ana.id },
    ],
  });

  const group = await prisma.group.create({
    data: {
      name: "Household",
      members: {
        createMany: {
          data: [{ userId: ana.id }, { userId: rafael.id }, { userId: john.id }],
        },
      },
    },
  });

  // Create multiple expenses
  await prisma.expense.createMany({
    data: [
      {
        date: new Date(),
        amount: 1000,
        description: "Lunch",
        groupId: group.id,
        paidById: rafael.id,
      }, // 1000 / 3 = 333.33
      {
        date: new Date(),
        amount: 500,
        description: "Dinner",
        groupId: group.id,
        paidById: ana.id,
      }, // 500 / 3 = 166.67
      {
        date: new Date(),
        amount: 1200,
        description: "Groceries",
        groupId: group.id,
        paidById: john.id,
      }, // 1200 / 3 = 400
      {
        date: new Date(),
        amount: 1500,
        description: "Rent",
        groupId: group.id,
        paidById: ana.id,
      }, // 1500 / 3 = 500
      {
        date: new Date(),
        amount: 300,
        description: "Utilities",
        groupId: group.id,
        paidById: rafael.id,
      }, // 300 / 3 = 100
      {
        date: new Date(),
        amount: 200,
        description: "Internet",
        groupId: group.id,
        paidById: john.id,
      }, // 200 / 3 = 66.67
      {
        date: new Date(),
        amount: 100,
        description: "Gym",
        groupId: group.id,
        paidById: ana.id,
      },
      {
        date: new Date(),
        amount: 500,
        description: "Netflix",
        groupId: group.id,
        paidById: rafael.id,
      },
      {
        date: new Date(),
        amount: 100,
        description: "Spotify",
        groupId: group.id,
        paidById: john.id,
      },
    ],
  });

  // Retrieve the expense IDs
  const lunchExpenseId = (await prisma.expense.findFirst({
    where: { description: "Lunch" },
  }))!.id;

  const dinnerExpenseId = (await prisma.expense.findFirst({
    where: { description: "Dinner" },
  }))!.id;

  const groceriesExpenseId = (await prisma.expense.findFirst({
    where: { description: "Groceries" },
  }))!.id;

  const rentExpenseId = (await prisma.expense.findFirst({
    where: { description: "Rent" },
  }))!.id;

  const utilitiesExpenseId = (await prisma.expense.findFirst({
    where: { description: "Utilities" },
  }))!.id;

  const internetExpenseId = (await prisma.expense.findFirst({
    where: { description: "Internet" },
  }))!.id;

  const gymExpenseId = (await prisma.expense.findFirst({
    where: { description: "Gym" },
  }))!.id;

  const netflixExpenseId = (await prisma.expense.findFirst({
    where: { description: "Netflix" },
  }))!.id;

  const spotifyExpenseId = (await prisma.expense.findFirst({
    where: { description: "Spotify" },
  }))!.id;

  // Create splits for the expenses
  await prisma.split.createMany({
    data: [
      // Splits for the first expense (Lunch)
      {
        amount: 333.33,
        userId: ana.id,
        expenseId: lunchExpenseId,
      },
      {
        amount: 333.33,
        userId: rafael.id,
        expenseId: lunchExpenseId,
      },
      {
        amount: 333.33,
        userId: john.id,
        expenseId: lunchExpenseId,
      },

      // Splits for the second expense (Dinner)
      {
        amount: 166.67,
        userId: ana.id,
        expenseId: dinnerExpenseId,
      },
      {
        amount: 166.67,
        userId: rafael.id,
        expenseId: dinnerExpenseId,
      },
      {
        amount: 166.67,
        userId: john.id,
        expenseId: dinnerExpenseId,
      },

      // Splits for the third expense (Groceries)
      {
        amount: 400,
        userId: ana.id,
        expenseId: groceriesExpenseId,
      },
      {
        amount: 400,
        userId: rafael.id,
        expenseId: groceriesExpenseId,
      },
      {
        amount: 400,
        userId: john.id,
        expenseId: groceriesExpenseId,
      },

      // Splits for the fourth expense (Rent)
      {
        amount: 500,
        userId: ana.id,
        expenseId: rentExpenseId,
      },
      {
        amount: 500,
        userId: rafael.id,
        expenseId: rentExpenseId,
      },
      {
        amount: 500,
        userId: john.id,
        expenseId: rentExpenseId,
      },

      // Splits for the fifth expense (Utilities)
      {
        amount: 100,
        userId: ana.id,
        expenseId: utilitiesExpenseId,
      },
      {
        amount: 100,
        userId: rafael.id,
        expenseId: utilitiesExpenseId,
      },
      {
        amount: 100,
        userId: john.id,
        expenseId: utilitiesExpenseId,
      },

      // Splits for the sixth expense (Internet)
      {
        amount: 66.67,
        userId: ana.id,
        expenseId: internetExpenseId,
      },
      {
        amount: 66.67,
        userId: rafael.id,
        expenseId: internetExpenseId,
      },
      {
        amount: 66.67,
        userId: john.id,
        expenseId: internetExpenseId,
      },

      // Splits for the seventh expense (Gym)
      {
        amount: 20,
        userId: ana.id,
        expenseId: gymExpenseId,
      },
      {
        amount: 50,
        userId: rafael.id,
        expenseId: gymExpenseId,
      },
      {
        amount: 30,
        userId: john.id,
        expenseId: gymExpenseId,
      },

      // Splits for the eighth expense (Netflix)
      {
        amount: 166.67,
        userId: ana.id,
        expenseId: netflixExpenseId,
      },
      {
        amount: 166.67,
        userId: rafael.id,
        expenseId: netflixExpenseId,
      },
      {
        amount: 166.67,
        userId: john.id,
        expenseId: netflixExpenseId,
      },

      // Splits for the ninth expense (Spotify)
      {
        amount: 33.33,
        userId: ana.id,
        expenseId: spotifyExpenseId,
      },
      {
        amount: 33.33,
        userId: rafael.id,
        expenseId: spotifyExpenseId,
      },
      {
        amount: 33.33,
        userId: john.id,
        expenseId: spotifyExpenseId,
      },
    ],
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
