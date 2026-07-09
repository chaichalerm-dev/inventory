"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { fail, ok, type ActionResult } from "@/lib/action-result";
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
  const { orgId } = await requireAdmin();
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("อีเมลนี้ถูกใช้งานแล้ว", { email: ["อีเมลนี้ถูกใช้งานแล้ว"] });
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
      return fail("อีเมลนี้ถูกใช้งานแล้ว", { email: ["อีเมลนี้ถูกใช้งานแล้ว"] });
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
  const { orgId } = await requireAdmin();
  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }
  const { name, email, password } = parsed.data;

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
    select: { userId: true },
  });
  if (!membership) return fail("ไม่พบผู้ใช้งานนี้");

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
      return fail("อีเมลนี้ถูกใช้งานแล้ว", { email: ["อีเมลนี้ถูกใช้งานแล้ว"] });
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
  const { orgId } = await requireAdmin();
  const parsedRole = assignableRoleSchema.safeParse(role);
  if (!parsedRole.success) return fail("สิทธิ์ไม่ถูกต้อง");

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
  });
  if (!membership) return fail("ไม่พบผู้ใช้งานนี้");
  if (membership.role === "OWNER") {
    return fail("ไม่สามารถเปลี่ยนสิทธิ์เจ้าของระบบได้");
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
  const { orgId, userId } = await requireAdmin();

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: orgId },
  });
  if (!membership) return fail("ไม่พบผู้ใช้งานนี้");
  if (membership.role === "OWNER") {
    return fail("ไม่สามารถลบเจ้าของระบบได้");
  }
  if (membership.userId === userId) {
    return fail("ไม่สามารถลบบัญชีของตัวเองได้");
  }

  await prisma.membership.delete({ where: { id: membershipId } });

  revalidatePath("/users");
  return ok();
}
