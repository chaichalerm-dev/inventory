"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  assignableRoleSchema,
  inviteUserSchema,
  updateMemberSchema,
  type InviteUserInput,
  type UpdateMemberInput,
} from "@/features/users/schemas";

export async function inviteUserAction(
  input: InviteUserInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail(dict.users.emailTaken, { email: [dict.users.emailTaken] });
  }

  const passwordHash = await hash(password, 12);
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        memberships: { create: { organizationId: orgId, role } },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail(dict.users.emailTaken, { email: [dict.users.emailTaken] });
    }
    throw error;
  }

  revalidatePath("/users");
  return ok();
}

export async function updateMemberAction(
  membershipId: string,
  input: UpdateMemberInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
  }
  const { name, email, password } = parsed.data;

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
    select: { userId: true },
  });
  if (!membership) return fail(dict.users.notFound);

  try {
    await prisma.user.update({
      where: { id: membership.userId },
      data: {
        name,
        email,
        ...(password ? { passwordHash: await hash(password, 12) } : {}),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail(dict.users.emailTaken, { email: [dict.users.emailTaken] });
    }
    throw error;
  }

  revalidatePath("/users");
  return ok();
}

export async function updateMemberRoleAction(
  membershipId: string,
  role: string,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId } = await requireAdmin();
  const parsedRole = assignableRoleSchema.safeParse(role);
  if (!parsedRole.success) return fail(dict.users.invalidRole);

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
  });
  if (!membership) return fail(dict.users.notFound);
  if (membership.role === "OWNER") {
    return fail(dict.users.cannotChangeOwnerRole);
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: parsedRole.data },
  });

  revalidatePath("/users");
  return ok();
}

export async function removeMemberAction(
  membershipId: string,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const { orgId, userId } = await requireAdmin();

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
  });
  if (!membership) return fail(dict.users.notFound);
  if (membership.role === "OWNER") {
    return fail(dict.users.cannotDeleteOwner);
  }
  if (membership.userId === userId) {
    return fail(dict.users.cannotDeleteSelf);
  }

  await prisma.membership.delete({ where: { id: membershipId } });

  revalidatePath("/users");
  return ok();
}
