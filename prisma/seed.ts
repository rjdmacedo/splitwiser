import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = {
    ana: "ana@mail.com",
    rafael: "rafael@mail.com",
    john: "john@mail.com",
  };

  // Delete all users from the database
  for (const key in email) {
    await prisma.user.delete({ where: { email: email[key as keyof typeof email] } }).catch(() => {
      // No worries if it doesn't exist yet
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

  // Create group and expenses
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

  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        date: new Date(),
        amount: 1000,
        description: "Lunch",
        groupId: group.id,
      },
    }),
    prisma.expense.create({
      data: {
        date: new Date(),
        amount: 500,
        description: "Dinner",
        groupId: group.id,
      },
    }),
    // Add other expenses as needed
  ]);

  // Create splits for each expense
  await Promise.all([
    prisma.split.create({
      data: {
        amount: 333.33,
        expenseId: expenses.find((e) => e.description === "Lunch")!.id,
        userId: ana.id,
      },
    }),
    prisma.split.create({
      data: {
        amount: 333.33,
        expenseId: expenses.find((e) => e.description === "Lunch")!.id,
        userId: rafael.id,
      },
    }),
    prisma.split.create({
      data: {
        amount: 333.33,
        expenseId: expenses.find((e) => e.description === "Lunch")!.id,
        userId: john.id,
      },
    }),
    // Add other splits as needed
  ]);

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
