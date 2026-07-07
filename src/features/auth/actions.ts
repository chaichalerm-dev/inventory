"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/schemas";

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("An account with this email already exists");
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

export async function signInAction(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Invalid input", parsed.error.flatten().fieldErrors);
  }
  return signInWithCredentials(parsed.data);
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
      return fail("Invalid email or password");
    }
    throw error;
  }
}
