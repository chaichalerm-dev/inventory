import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export type SessionContext = {
  userId: string;
  orgId: string;
  role: MembershipRole;
};

/**
 * The JWT is a snapshot from sign-in time — it can't be revoked and its role
 * claim goes stale the moment an admin demotes or removes the member. Every
 * authorization decision therefore re-reads the membership. React's cache()
 * dedupes this to one query per request no matter how many layouts/pages ask.
 */
const getLiveMembership = cache(
  async (userId: string, orgId: string): Promise<MembershipRole | null> => {
    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId: orgId },
      select: { role: true },
    });
    return membership?.role ?? null;
  },
);

/**
 * True when the request carries a session whose membership still exists.
 * The (auth) layout uses this to decide whether to bounce visitors to the
 * dashboard — checking the cookie alone would trap removed members in a
 * redirect loop between /sign-in and /dashboard.
 */
export async function hasActiveSession(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.orgId) return false;
  const role = await getLiveMembership(session.user.id, session.user.orgId);
  return role !== null;
}

/**
 * The single gate every server component and server action goes through.
 * Redirects to sign-in when unauthenticated or when the membership behind
 * the cookie has been revoked, so callers can rely on a non-null tenant
 * context — no per-callsite null checks. The returned role is live, not the
 * JWT's snapshot.
 */
export async function requireSession(): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.orgId) {
    redirect("/sign-in");
  }
  const role = await getLiveMembership(session.user.id, session.user.orgId);
  if (!role) {
    redirect("/sign-in");
  }
  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role,
  };
}

/**
 * Gate for admin-only pages. Members are sent back to their dashboard
 * instead of an error page — the nav never links them here anyway.
 */
export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await requireSession();
  if (!isAdminRole(ctx.role)) redirect("/dashboard");
  return ctx;
}
