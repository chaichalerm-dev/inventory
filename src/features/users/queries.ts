import "server-only";
import { prisma } from "@/lib/prisma";
import type { MembershipRole } from "@/generated/prisma/enums";

export type MemberRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: MembershipRole;
  createdAt: string;
};

export async function getMembers(orgId: string): Promise<MemberRow[]> {
  const memberships = await prisma.membership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    membershipId: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    createdAt: m.createdAt.toISOString(),
  }));
}
