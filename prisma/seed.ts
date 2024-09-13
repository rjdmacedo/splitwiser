import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // Define user email mappings
  const email = {
    ana: "ana@mail.com",
    john: "john@mail.com",
    jane: "jane@mail.com",
    rafael: "rafael@mail.com",
  };

  // Delete all users from the database
  for (const key in email) {
    await prisma.user.delete({ where: { email: email[key as keyof typeof email] } }).catch(() => {
      // no worries if it doesn't exist yet
    });
  }

  await prisma.group.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("password", 10);

  // Create users
  const rafael = await prisma.user.create({
    data: {
      name: "Rafael Macedo",
      email: email.rafael,
      password: {
        create: { hash: hashedPassword },
      },
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: "Ana Ferreira",
      email: email.ana,
      password: {
        create: { hash: hashedPassword },
      },
    },
  });

  const john = await prisma.user.create({
    data: {
      name: "John Doe",
      email: email.john,
      password: {
        create: { hash: hashedPassword },
      },
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: email.jane,
      password: {
        create: { hash: hashedPassword },
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
      { userId: ana.id, friendId: jane.id },
      { userId: jane.id, friendId: ana.id },
      { userId: john.id, friendId: jane.id },
      { userId: jane.id, friendId: john.id },
      { userId: rafael.id, friendId: jane.id },
      { userId: jane.id, friendId: rafael.id },
    ],
  });

  // Create a group
  const group = await prisma.group.create({
    data: {
      name: "Household",
      members: {
        createMany: { data: [{ userId: ana.id }, { userId: rafael.id }, { userId: john.id }, { userId: jane.id }] },
      },
    },
  });

  // Create multiple expenses with payments
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        description: "Lunch",
        amount: 400,
        date: new Date(),
        groupId: group.id,
        payments: {
          create: [
            { amount: 125, paidById: rafael.id },
            { amount: 200, paidById: ana.id },
            { amount: 75, paidById: john.id },
          ],
        },
      },
    }),
  ]);

  // Create splits for the expenses
  await Promise.all(
    expenses.map((expense) =>
      prisma.split.createMany({
        data: [
          { amount: expense.amount / 4, expenseId: expense.id, userId: ana.id },
          { amount: expense.amount / 4, expenseId: expense.id, userId: rafael.id },
          { amount: expense.amount / 4, expenseId: expense.id, userId: john.id },
          { amount: expense.amount / 4, expenseId: expense.id, userId: jane.id },
        ],
      }),
    ),
  );

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
