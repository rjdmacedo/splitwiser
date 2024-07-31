import { Prisma } from ".prisma/client";

import { prisma } from "~/db.server";

import GroupCreateInput = Prisma.GroupCreateInput;

export function getGroupById(id: string) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      expenses: {
        include: {
          splits: true,
        },
      },
    },
  });
}

export function createGroup({ name, userId }: GroupCreateInput & { userId: string }) {
  return prisma.group.create({
    data: {
      name,
      members: {
        create: {
          userId,
        },
      },
    },
  });
}
