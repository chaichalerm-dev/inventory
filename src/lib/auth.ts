import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { MembershipRole } from "@/generated/prisma/enums";
import { signInSchema } from "@/features/auth/schemas";
import {
  assertNotRateLimited,
  clearLoginAttempts,
  recordFailedLogin,
} from "@/lib/login-rate-limit";

export type VerifiedCredentials = {
  userId: string;
  name: string;
  orgId: string;
  role: MembershipRole;
};

// A real bcrypt hash of a throwaway string, compared against when the email
// doesn't exist — without it, unknown emails return in ~1ms while known ones
// take a full bcrypt verify, letting an attacker enumerate accounts by
// timing the login endpoint.
const DUMMY_PASSWORD_HASH =
  "$2b$12$Cw0DefKS7AvTePyKOEvW6uQAl6W76QTOGksQVgKWrOwusK0N8eEJq";

/**
 * Single source of truth for "is this email+password combination valid".
 * Role/org membership must never be looked up or revealed to a caller
 * before this succeeds — checking role first (e.g. to validate a login
 * tab choice) would let anyone probe whether an email exists and what
 * role it has without ever proving they know the password.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<VerifiedCredentials | null> {
  assertNotRateLimited(email);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { take: 1 } },
  });
  if (!user) {
    await compare(password, DUMMY_PASSWORD_HASH);
    recordFailedLogin(email);
    return null;
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    recordFailedLogin(email);
    return null;
  }

  const membership = user.memberships[0];
  if (!membership) return null;

  clearLoginAttempts(email);
  return {
    userId: user.id,
    name: user.name,
    orgId: membership.organizationId,
    role: membership.role,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sessions expire after 9 hours regardless of activity, so a workstation
  // left signed in past a shift can't be picked up by someone else later.
  session: { strategy: "jwt", maxAge: 60 * 60 * 9 },
  pages: { signIn: "/sign-in" },
  logger: {
    error(error) {
      // A cookie signed with a rotated AUTH_SECRET is an expected condition,
      // handled by treating the visitor as signed out — log it quietly
      // instead of a full stack trace on every request.
      if (error.name === "JWTSessionError") {
        console.warn("[auth] stale session cookie ignored (signed out)");
        return;
      }
      console.error(error);
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const result = await verifyCredentials(parsed.data.email, parsed.data.password);
        if (!result) return null;

        return {
          id: result.userId,
          name: result.name,
          email: parsed.data.email,
          orgId: result.orgId,
          role: result.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // `user` is only present on initial sign-in.
      if (user) {
        token.uid = user.id as string;
        token.orgId = user.orgId;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid;
      session.user.orgId = token.orgId;
      session.user.role = token.role;
      return session;
    },
  },
});
