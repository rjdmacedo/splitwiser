import { Prisma } from "@prisma/client";

import { prisma } from "~/db.server";

import GroupCreateInput = Prisma.GroupCreateInput;

export async function getGroupById(id: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        expenses: {
          include: {
            paidBy: true,
            splits: { include: { user: true } },
          },
        },
      },
    });
    if (!group) {
      throw new Error("Group not found");
    }
    return group;
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
}

export async function createGroup({ name, userId }: GroupCreateInput & { userId: string }) {
  try {
    return await prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId,
          },
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
}

export async function updateGroup(id: string, data: Prisma.GroupUpdateInput) {
  try {
    return await prisma.group.update({
      where: { id },
      data,
    });
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
}

export async function addMemberToGroup(groupId: string, email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User with the provided email not found");
    }

    // Check if the user is already in the group
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });
    if (existingMember) {
      throw new Error("User is already a member of the group");
    }

    return await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          create: {
            userId: user.id,
          },
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  try {
    return await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          delete: {
            userId_groupId: {
              userId,
              groupId,
            },
          },
        },
      },
    });
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
}
