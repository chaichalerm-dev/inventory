"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut, verifyCredentials } from "@/lib/auth";
import { LoginRateLimitError } from "@/lib/login-rate-limit";
import { isDbUnavailableError, prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { isAdminRole } from "@/lib/roles";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  getDictionary,
  interpolate,
  type Dictionary,
} from "@/lib/i18n/get-dictionary";
import {
  signInFormSchema,
  signUpSchema,
  type SignInFormInput,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/schemas";

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, organizationName } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return fail(dict.users.emailTaken);
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
  } catch (error) {
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }

  return signInWithCredentials({ email, password }, dict);
}

export async function signInAction(
  input: SignInFormInput,
): Promise<ActionResult> {
  const dict = getDictionary(await getLocale());
  const parsed = signInFormSchema.safeParse(input);
  if (!parsed.success) {
    return fail(dict.auth.invalidInput, parsed.error.flatten().fieldErrors);
  }
  const { portal, email, password } = parsed.data;

  // Verify the password before ever looking at role. Checking role first
  // (e.g. to validate the tab choice) would let anyone submit a real email
  // with a wrong password and learn whether that account exists and
  // whether it's an admin — without ever proving they know the password.
  let verified;
  try {
    verified = await verifyCredentials(email, password);
  } catch (error) {
    if (error instanceof LoginRateLimitError) {
      const minutes = Math.ceil(error.retryAfterMs / 60_000);
      return fail(interpolate(dict.auth.tooManyAttempts, { minutes }));
    }
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }
  if (!verified) {
    return fail(dict.auth.invalidCredentials);
  }
  if (portal === "ADMIN" && !isAdminRole(verified.role)) {
    return fail(dict.auth.wrongTabIsUser);
  }
  if (portal === "USER" && isAdminRole(verified.role)) {
    return fail(dict.auth.wrongTabIsAdmin);
  }

  return signInWithCredentials({ email, password }, dict);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/sign-in" });
}

async function signInWithCredentials(
  input: SignInInput,
  dict: Dictionary,
): Promise<ActionResult> {
  try {
    await signIn("credentials", { ...input, redirectTo: "/dashboard" });
    return ok();
  } catch (error) {
    // signIn signals success by throwing Next's redirect — let it through.
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return fail(dict.auth.invalidCredentials);
    }
    if (isDbUnavailableError(error)) {
      return fail(dict.auth.dbSlow);
    }
    throw error;
  }
}
