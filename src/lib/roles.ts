import type { MembershipRole } from "@/generated/prisma/enums";

// OWNER and ADMIN share the admin experience; MEMBER is the employee portal.
export function isAdminRole(role: MembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export const roleLabels: Record<MembershipRole, string> = {
  OWNER: "เจ้าของระบบ",
  ADMIN: "ผู้ดูแลระบบ",
  MEMBER: "พนักงาน",
};
