import "server-only";
import { redirect } from "next/navigation";
import type { MembershipRole } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export type SessionContext = {
  userId: string;
  orgId: string;
  role: MembershipRole;
};

/**
 * The single gate every server component and server action goes through.
 * Redirects to sign-in when unauthenticated, so callers can rely on a
 * non-null tenant context — no per-callsite null checks.
 */
export async function requireSession(): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.orgId) {
    redirect("/sign-in");
  }
  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
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
