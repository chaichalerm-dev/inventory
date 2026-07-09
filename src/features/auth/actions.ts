"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { isAdminRole } from "@/lib/roles";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  signInFormSchema,
  signUpSchema,
  type SignInFormInput,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/schemas";

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("อีเมลนี้ถูกใช้งานแล้ว");
  }

  const passwordHash = await hash(password, 12);

  // User, org, and OWNER membership must exist together or not at all.
  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName, slug: uniqueSlug(organizationName) },
    });
    await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        memberships: {
          create: { organizationId: organization.id, role: "OWNER" },
        },
      },
    });
  });

  return signInWithCredentials({ email, password });
}

export async function signInAction(
  input: SignInFormInput,
): Promise<ActionResult> {
  const parsed = signInFormSchema.safeParse(input);
  if (!parsed.success) {
    return fail("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }
  const { portal, email, password } = parsed.data;

  // Enforce the tab choice: an employee cannot enter through Admin Login and
  // vice versa. Checked before signIn because a successful signIn redirects.
  const user = await prisma.user.findUnique({
    where: { email },
    select: { memberships: { take: 1, select: { role: true } } },
  });
  const role = user?.memberships[0]?.role;
  if (role) {
    if (portal === "ADMIN" && !isAdminRole(role)) {
      return fail("บัญชีนี้เป็นบัญชีพนักงาน กรุณาเข้าสู่ระบบผ่านแท็บ User Login");
    }
    if (portal === "USER" && isAdminRole(role)) {
      return fail("บัญชีนี้เป็นผู้ดูแลระบบ กรุณาเข้าสู่ระบบผ่านแท็บ Admin Login");
    }
  }

  return signInWithCredentials({ email, password });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/sign-in" });
}

async function signInWithCredentials(input: SignInInput): Promise<ActionResult> {
  try {
    await signIn("credentials", { ...input, redirectTo: "/dashboard" });
    return ok();
  } catch (error) {
    // signIn signals success by throwing Next's redirect — let it through.
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return fail("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
    throw error;
  }
}
